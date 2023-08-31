import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { unwrap } from "solid-js/store";

import { Config, StructurePlan } from "../../data";
import * as Domain from "../../domain";
import { DynamicObjectivePlan } from "./utils";

type Lane = {
	current: DcsJs.Position | undefined;
	target: DcsJs.Position;
};

const rangeMultiplier = 1;

function selectObjective(
	sourcePosition: DcsJs.Position,
	targetPosition: DcsJs.Position,
	objectives: Array<DcsJs.Import.Objective>,
) {
	const sourceDistance = Domain.Location.distanceToPosition(sourcePosition, targetPosition);

	const nearbyObjectives = Domain.Location.findInside(objectives, sourcePosition, (obj) => obj.position, 20_000);

	const forwardObjectives = nearbyObjectives.filter((obj) => {
		const objDistance = Domain.Location.distanceToPosition(obj.position, targetPosition);

		return objDistance < sourceDistance && objDistance > 20_000;
	});

	const selectedObjective = Domain.Utils.randomItem(forwardObjectives);

	return selectedObjective;
}

function addObjectivePlan(
	objectivePlans: Array<DynamicObjectivePlan>,
	objective: DcsJs.Import.Objective,
	groundUnit?: string,
	structure?: StructurePlan,
) {
	const next = structuredClone(unwrap(objectivePlans));
	const index = objectivePlans.findIndex((plan) => plan.objectiveName === objective.name);

	if (index === -1) {
		next.push({
			objectiveName: objective.name,
			structures: structure == null ? [] : [structure],
			groundUnitTypes: groundUnit == null ? [] : [groundUnit],
			objective,
		});
	} else {
		const prev = objectivePlans[index];
		const structures = prev?.structures ?? [];
		const groundUnitTypes = prev?.groundUnitTypes ?? [];
		next[index] = {
			objectiveName: objective.name,
			structures: structure == null ? structures : [...structures, structure],
			groundUnitTypes: groundUnit == null ? groundUnitTypes : [...groundUnitTypes, groundUnit],
			objective,
		};
	}

	return next;
}

function addBasicObjective(
	lanes: Array<Lane>,
	objectivePlans: Array<DynamicObjectivePlan>,
	oppObjectivePlans: Array<DynamicObjectivePlan>,
	objectives: Array<DcsJs.Import.Objective>,
) {
	lanes.forEach((lane) => {
		if (lane.current == null) {
			return;
		}

		/* const oppAirdrome = Domain.Location.findNearest(oppPositions, sourcePosition, (ad) => ad);

		if (oppAirdrome == null) {
			throw new Error("no red airdrome found");
		} */

		const selectedObjective = selectObjective(lane.current, lane.target, objectives);

		if (selectedObjective != null) {
			objectivePlans = addObjectivePlan(objectivePlans, selectedObjective);

			const oppObjectivesInRange = Domain.Location.findInside(
				oppObjectivePlans,
				selectedObjective.position,
				(obj) => obj.objective.position,
				30_000,
			);

			if (oppObjectivesInRange.length > 0) {
				lane.current = undefined;
			} else {
				lane.current = selectedObjective?.position;
			}
		} else {
			lane.current = undefined;
		}
	});

	return objectivePlans;
}

function fillObjectives(
	bluePlans: Array<DynamicObjectivePlan>,
	redPlans: Array<DynamicObjectivePlan>,
	objectives: Array<DcsJs.Import.Objective>,
): [Array<DynamicObjectivePlan>, Array<DynamicObjectivePlan>] {
	let blue = bluePlans;
	let red = redPlans;

	objectives.forEach((obj) => {
		const isBlue = bluePlans.some((plan) => plan.objectiveName === obj.name);
		const isRed = redPlans.some((plan) => plan.objectiveName === obj.name);

		if (isBlue || isRed) {
			return;
		}

		const nearestBlue = Domain.Location.findNearest(bluePlans, obj.position, (op) => op.objective.position);
		const nearestRed = Domain.Location.findNearest(redPlans, obj.position, (op) => op.objective.position);

		const distanceBlue =
			nearestBlue == null
				? 999_999_999
				: Domain.Location.distanceToPosition(nearestBlue.objective.position, obj.position);
		const distanceRed =
			nearestRed == null
				? 999_999_999
				: Domain.Location.distanceToPosition(nearestRed.objective.position, obj.position);

		if (distanceBlue <= distanceRed) {
			blue = addObjectivePlan(blue, obj);
		} else {
			red = addObjectivePlan(red, obj);
		}
	});

	return [blue, red];
}

function addAirdromeSamObjectives(
	airdromes: Array<DcsJs.DCS.Airdrome>,
	oppAirdromes: Array<DcsJs.DCS.Airdrome>,
	objectives: Array<DcsJs.Import.Objective>,
	objectivePlans: Array<DynamicObjectivePlan>,
) {
	airdromes.forEach((airdrome) => {
		const oppAirdrome = Domain.Location.findNearest(oppAirdromes, airdrome, (ad) => ad);

		if (oppAirdrome == null) {
			return;
		}

		const nearbyObjectives = Domain.Location.findInside(objectives, airdrome, (obj) => obj.position, 40_000);
		const sourceDistance = Domain.Location.distanceToPosition(airdrome, oppAirdrome);

		const forwardObjectives = nearbyObjectives.filter((obj) => {
			const objDistance = Domain.Location.distanceToPosition(obj.position, oppAirdrome);

			return objDistance < sourceDistance && objDistance > 30_000;
		});

		const selectedObjective = Domain.Utils.randomItem(forwardObjectives);

		if (selectedObjective == null) {
			const farEnoughFromOppAirdrome = nearbyObjectives.filter((obj) => {
				const objDistance = Domain.Location.distanceToPosition(obj.position, oppAirdrome);

				return objDistance > 30_000;
			});

			const fallbackObjective = Domain.Utils.randomItem(farEnoughFromOppAirdrome);

			if (fallbackObjective == null) {
				return;
			}

			objectivePlans = addObjectivePlan(objectivePlans, fallbackObjective, "sam");

			return;
		}

		objectivePlans = addObjectivePlan(objectivePlans, selectedObjective, "sam");
	});

	return objectivePlans;
}

function validStructureObjective({
	sourcePosition,
	objectivePlans,
	oppObjectivePlans,
	objectives,
	strikeTargets,
	range,
}: {
	sourcePosition: DcsJs.Position;
	objectivePlans: Array<DynamicObjectivePlan>;
	oppObjectivePlans: Array<DynamicObjectivePlan>;
	objectives: Array<DcsJs.Import.Objective>;
	strikeTargets: Record<string, Array<DcsJs.StrikeTarget>>;
	range: number;
}) {
	const objectivesInRange = Domain.Location.findInside(objectives, sourcePosition, (obj) => obj.position, range);

	const freeObjectives = objectivesInRange.filter((obj) => {
		const plan = objectivePlans.find((op) => op.objectiveName === obj.name);
		const target = strikeTargets[obj.name];

		if (target == null) {
			return false;
		}

		const targetCount = target.filter((trg) => trg.type === "Structure").length;

		if (targetCount === 0) {
			return false;
		}

		if (plan == null) {
			return true;
		}

		const planCount = plan.structures.length;

		return planCount < targetCount;
	});

	const friendlyObjectives = freeObjectives.filter((obj) => {
		const nearestCoalition = Domain.Location.findNearest(objectivePlans, obj.position, (op) => op.objective.position);
		const nearestOpp = Domain.Location.findNearest(oppObjectivePlans, obj.position, (op) => op.objective.position);

		if (nearestCoalition == null) {
			return false;
		}

		if (nearestOpp == null) {
			return true;
		}

		const coalitionDistance = Domain.Location.distanceToPosition(nearestCoalition.objective.position, obj.position);
		const oppDistance = Domain.Location.distanceToPosition(nearestOpp.objective.position, obj.position);

		return coalitionDistance <= oppDistance;
	});

	return Domain.Utils.randomItem(friendlyObjectives);
}

function addStructures({
	objectivePlans,
	oppObjectivePlans,
	objectives,
	strikeTargets,
	range,
	structureType,
}: {
	objectivePlans: Array<DynamicObjectivePlan>;
	oppObjectivePlans: Array<DynamicObjectivePlan>;
	objectives: Array<DcsJs.Import.Objective>;
	strikeTargets: Record<string, Array<DcsJs.StrikeTarget>>;
	range: number;
	structureType: DcsJs.StructureType;
}) {
	objectivePlans.forEach((plan) => {
		const existingStructures = objectivePlans.filter((op) =>
			op.structures.some((str) => str.structureType === structureType),
		);

		const existingStructuresInRange = Domain.Location.findInside(
			existingStructures,
			plan.objective.position,
			(pp) => pp.objective.position,
			range,
		);

		if (existingStructuresInRange.length > 0) {
			return;
		}

		const selectedObjective = validStructureObjective({
			sourcePosition: plan.objective.position,
			objectivePlans,
			oppObjectivePlans,
			objectives,
			strikeTargets,
			range,
		});

		if (selectedObjective == null) {
			return;
		}

		const structureName = strikeTargets[selectedObjective.name]?.find(
			(trg) =>
				trg.type === "Structure" &&
				!objectivePlans.some((plan) => plan.structures.some((str) => str.structureName === trg.name)),
		)?.name;

		if (structureName == null) {
			return;
		}

		objectivePlans = addObjectivePlan(objectivePlans, selectedObjective, undefined, {
			structureName: structureName,
			structureType: structureType,
		});
	});

	return objectivePlans;
}

function addFrontline(
	objectivePlans: Array<DynamicObjectivePlan>,
	oppObjectivePlans: Array<DynamicObjectivePlan>,
	objectives: Array<DcsJs.Import.Objective>,
) {
	objectives.forEach((obj) => {
		const nearestFriendly = Domain.Location.findNearest(objectivePlans, obj.position, (op) => op.objective.position);

		const nearestOpp = Domain.Location.findNearest(oppObjectivePlans, obj.position, (op) => op.objective.position);

		if (nearestOpp == null || nearestFriendly == null) {
			return;
		}

		const distanceFriendly = Domain.Location.distanceToPosition(obj.position, nearestFriendly.objective.position);
		const distanceOpp = Domain.Location.distanceToPosition(obj.position, nearestOpp.objective.position);

		if (distanceOpp <= 30_000 && distanceFriendly < distanceOpp) {
			objectivePlans = addObjectivePlan(objectivePlans, obj, "vehicles");
		}
	});

	return objectivePlans;
}

function generateLanes(startPositions: Array<DcsJs.Position>, targetPositions: Array<DcsJs.Position>) {
	const lanes: Array<Lane> = [];

	startPositions.forEach((start) => {
		targetPositions.forEach((target) => {
			if (Domain.Location.distanceToPosition(start, target) < 200_000) {
				lanes.push({ current: start, target: target });
			}
		});
	});

	return lanes;
}

function generateFactionStructures({
	objectivePlans,
	oppObjectivePlans,
	objectives,
	strikeTargets,
}: {
	objectivePlans: Array<DynamicObjectivePlan>;
	oppObjectivePlans: Array<DynamicObjectivePlan>;
	objectives: Array<DcsJs.Import.Objective>;
	strikeTargets: Record<string, Array<DcsJs.StrikeTarget>>;
}) {
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range: Config.structureRange.frontline.depot * rangeMultiplier,
		structureType: "Depot",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range: Config.structureRange.frontline.barrack * rangeMultiplier,
		structureType: "Barrack",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range: Config.structureRange.power * rangeMultiplier,
		structureType: "Power Plant",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range: Config.structureRange.ammo * rangeMultiplier,
		structureType: "Ammo Depot",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range: Config.structureRange.fuel * rangeMultiplier,
		structureType: "Fuel Storage",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range: Config.structureRange.hospital * rangeMultiplier,
		structureType: "Hospital",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range: Config.structureRange.frontline.farp * rangeMultiplier,
		structureType: "Farp",
	});

	return objectivePlans;
}

export function generateObjectivePlans(
	bluePositions: Array<DcsJs.Position>,
	redPositions: Array<DcsJs.Position>,
	blueAirdromes: Array<DcsJs.DCS.Airdrome>,
	redAirdromes: Array<DcsJs.DCS.Airdrome>,
	dataStore: Types.Campaign.DataStore,
): [Array<DynamicObjectivePlan>, Array<DynamicObjectivePlan>] {
	const objectives = dataStore.objectives;
	const strikeTargets = dataStore.strikeTargets;

	if (objectives == null) {
		throw new Error("generateObjectivePlans: no objectives found");
	}

	if (strikeTargets == null) {
		throw new Error("generateObjectivePlans: no strike targets found");
	}

	let endOfLine = false;
	const blueLanes = generateLanes(bluePositions, redPositions);
	const redLanes = generateLanes(redPositions, bluePositions);

	let blueObjs: Array<DynamicObjectivePlan> = [];
	const maxBlueObjsCount = Domain.Utils.random(5, 12);
	let redObjs: Array<DynamicObjectivePlan> = [];

	// Basic Objectives
	while (!endOfLine) {
		if (blueObjs.length < maxBlueObjsCount) {
			blueObjs = addBasicObjective(blueLanes, blueObjs, redObjs, objectives);
		}
		redObjs = addBasicObjective(redLanes, redObjs, blueObjs, objectives);

		if (
			(!blueLanes.find((p) => p.current != null) || blueObjs.length >= maxBlueObjsCount) &&
			!redLanes.find((p) => p.current != null)
		) {
			endOfLine = true;
		}
	}

	[blueObjs, redObjs] = fillObjectives(blueObjs, redObjs, objectives);

	const samObjectives = objectives.filter((obj) => strikeTargets[obj.name]?.some((st) => st.type === "SAM"));

	blueObjs = addAirdromeSamObjectives(blueAirdromes, redAirdromes, samObjectives, blueObjs);
	redObjs = addAirdromeSamObjectives(redAirdromes, blueAirdromes, samObjectives, redObjs);

	blueObjs = generateFactionStructures({
		objectivePlans: blueObjs,
		objectives,
		oppObjectivePlans: redObjs,
		strikeTargets,
	});

	redObjs = generateFactionStructures({
		objectivePlans: redObjs,
		objectives,
		oppObjectivePlans: blueObjs,
		strikeTargets,
	});

	blueObjs = addFrontline(blueObjs, redObjs, objectives);
	redObjs = addFrontline(redObjs, blueObjs, objectives);

	return [blueObjs, redObjs];
}
