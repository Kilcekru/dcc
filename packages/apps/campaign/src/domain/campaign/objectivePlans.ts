import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { Config, StructurePlan } from "../../data";
import * as ECS from "../../ecs";
import { DynamicObjectivePlan } from "../../logic/createCampaign/utils";
import { Random } from "..";
import { distanceToPosition, findInside, findNearest, objectToPosition } from "../location";

type Lane = {
	current: DcsJs.Position | undefined;
	target: DcsJs.Position;
};

function generateLanes(startPositions: Array<ECS.Entities.Airdrome>, targetPositions: Array<ECS.Entities.Airdrome>) {
	const lanes: Array<Lane> = [];

	startPositions.forEach(({ position: start }) => {
		targetPositions.forEach(({ position: target }) => {
			if (distanceToPosition(start, target) < 200_000) {
				lanes.push({ current: start, target: target });
			}
		});
	});

	return lanes;
}

function selectObjective(
	sourcePosition: DcsJs.Position,
	targetPosition: DcsJs.Position,
	objectives: Array<DcsJs.Import.Objective>,
) {
	const sourceDistance = distanceToPosition(sourcePosition, targetPosition);

	const nearbyObjectives = findInside(objectives, sourcePosition, (obj) => obj.position, 20_000);

	const forwardObjectives = nearbyObjectives.filter((obj) => {
		const objDistance = distanceToPosition(obj.position, targetPosition);

		return objDistance < sourceDistance && objDistance > 20_000;
	});

	const selectedObjective = Random.item(forwardObjectives);

	return selectedObjective;
}

function addObjectivePlan(
	objectivePlans: Array<DynamicObjectivePlan>,
	objective: DcsJs.Import.Objective,
	groundUnit?: string,
	structure?: StructurePlan,
) {
	const next = structuredClone(objectivePlans);
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

		const selectedObjective = selectObjective(lane.current, lane.target, objectives);

		if (selectedObjective != null) {
			objectivePlans = addObjectivePlan(objectivePlans, selectedObjective);

			const oppObjectivesInRange = findInside(
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

		const nearestBlue = findNearest(bluePlans, obj.position, (op) => op.objective.position);
		const nearestRed = findNearest(redPlans, obj.position, (op) => op.objective.position);

		const distanceBlue =
			nearestBlue == null ? 999_999_999 : distanceToPosition(nearestBlue.objective.position, obj.position);
		const distanceRed =
			nearestRed == null ? 999_999_999 : distanceToPosition(nearestRed.objective.position, obj.position);

		if (distanceBlue <= distanceRed) {
			blue = addObjectivePlan(blue, obj);
		} else {
			red = addObjectivePlan(red, obj);
		}
	});

	return [blue, red];
}

function addAirdromeSamObjectives(
	airdromes: Array<ECS.Entities.Airdrome>,
	oppAirdromes: Array<ECS.Entities.Airdrome>,
	targets: Record<string, DcsJs.StrikeTarget[]>,
	objectives: Array<DcsJs.Import.Objective>,
	objectivePlans: Array<DynamicObjectivePlan>,
) {
	airdromes.forEach((airdrome) => {
		const oppAirdrome = findNearest(oppAirdromes, airdrome.position, (ad) => objectToPosition(ad));

		if (oppAirdrome == null) {
			return;
		}

		const validObjectives = objectives.filter((obj) => {
			const objTargets = targets[obj.name];

			if (objTargets == null) {
				return [];
			}

			return objTargets.some((target) => target.type === "SAM");
		});

		const nearbyObjectives = findInside(validObjectives, airdrome.position, (obj) => obj.position, 20_000);
		const sourceDistance = distanceToPosition(airdrome.position, oppAirdrome.position);

		const forwardObjectives = nearbyObjectives.filter((obj) => {
			const objDistance = distanceToPosition(obj.position, oppAirdrome.position);

			return objDistance < sourceDistance && objDistance > 30_000;
		});

		const selectedObjective = Random.item(forwardObjectives);

		if (selectedObjective == null) {
			const farEnoughFromOppAirdrome = nearbyObjectives.filter((obj) => {
				const objDistance = distanceToPosition(obj.position, oppAirdrome.position);

				return objDistance > 30_000;
			});

			const fallbackObjective = Random.item(farEnoughFromOppAirdrome);

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
	const objectivesInRange = findInside(objectives, sourcePosition, (obj) => obj.position, range);

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
		const nearestCoalition = findNearest(objectivePlans, obj.position, (op) => op.objective.position);
		const nearestOpp = findNearest(oppObjectivePlans, obj.position, (op) => op.objective.position);

		if (nearestCoalition == null) {
			return false;
		}

		if (nearestOpp == null) {
			return true;
		}

		const coalitionDistance = distanceToPosition(nearestCoalition.objective.position, obj.position);
		const oppDistance = distanceToPosition(nearestOpp.objective.position, obj.position);

		return coalitionDistance <= oppDistance;
	});

	return Random.item(friendlyObjectives);
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

		const existingStructuresInRange = findInside(
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

function generateFactionStructures({
	coalition,
	objectivePlans,
	oppObjectivePlans,
	objectives,
	strikeTargets,
}: {
	coalition: DcsJs.Coalition;
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
		range: Config.structureRange.frontline.depot * Config.structureRange.generateRangeMultiplier[coalition],
		structureType: "Depot",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range: Config.structureRange.frontline.barrack * Config.structureRange.generateRangeMultiplier[coalition],
		structureType: "Barrack",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range: Config.structureRange.power * Config.structureRange.generateRangeMultiplier[coalition],
		structureType: "Power Plant",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range: Config.structureRange.ammo * Config.structureRange.generateRangeMultiplier[coalition],
		structureType: "Ammo Depot",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range: Config.structureRange.fuel * Config.structureRange.generateRangeMultiplier[coalition],
		structureType: "Fuel Storage",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range: Config.structureRange.hospital * Config.structureRange.generateRangeMultiplier[coalition],
		structureType: "Hospital",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range: Config.structureRange.frontline.farp * Config.structureRange.generateRangeMultiplier[coalition],
		structureType: "Farp",
	});

	return objectivePlans;
}

function addFrontline(
	objectivePlans: Array<DynamicObjectivePlan>,
	oppObjectivePlans: Array<DynamicObjectivePlan>,
	objectives: Array<DcsJs.Import.Objective>,
) {
	objectives.forEach((obj) => {
		const nearestFriendly = findNearest(objectivePlans, obj.position, (op) => op.objective.position);

		const nearestOpp = findNearest(oppObjectivePlans, obj.position, (op) => op.objective.position);

		if (nearestOpp == null || nearestFriendly == null) {
			return;
		}

		const distanceFriendly = distanceToPosition(obj.position, nearestFriendly.objective.position);
		const distanceOpp = distanceToPosition(obj.position, nearestOpp.objective.position);

		if (distanceOpp <= Config.structureRange.frontline.barrack && distanceFriendly < distanceOpp) {
			objectivePlans = addObjectivePlan(objectivePlans, obj, "vehicles");
		}
	});

	return objectivePlans;
}

export function generateObjectivePlans({
	blueAirdromes,
	redAirdromes,
	blueRange,
	dataStore,
}: {
	blueAirdromes: Array<ECS.Entities.Airdrome>;
	redAirdromes: Array<ECS.Entities.Airdrome>;
	blueRange: [number, number];
	dataStore: Types.Campaign.DataStore;
}): [Array<DynamicObjectivePlan>, Array<DynamicObjectivePlan>] {
	const objectives = dataStore.objectives?.filter(
		(obj) => obj.type === "Town" || obj.type === "Terrain" || obj.type === "POI",
	);
	const strikeTargets = dataStore.strikeTargets;

	if (objectives == null) {
		throw new Error("generateObjectivePlans: no objectives found");
	}

	if (strikeTargets == null) {
		throw new Error("generateObjectivePlans: no strike targets found");
	}

	let endOfLine = false;
	const blueLanes = generateLanes(blueAirdromes, redAirdromes);
	const redLanes = generateLanes(redAirdromes, blueAirdromes);

	let blueObjs: Array<DynamicObjectivePlan> = [];
	const maxBlueObjsCount = Random.number(blueRange[0], blueRange[1]);
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

	blueObjs = addAirdromeSamObjectives(blueAirdromes, redAirdromes, strikeTargets, samObjectives, blueObjs);
	redObjs = addAirdromeSamObjectives(redAirdromes, blueAirdromes, strikeTargets, samObjectives, redObjs);

	blueObjs = generateFactionStructures({
		coalition: "blue",
		objectivePlans: blueObjs,
		objectives,
		oppObjectivePlans: redObjs,
		strikeTargets,
	});

	redObjs = generateFactionStructures({
		coalition: "red",
		objectivePlans: redObjs,
		objectives,
		oppObjectivePlans: blueObjs,
		strikeTargets,
	});

	blueObjs = addFrontline(blueObjs, redObjs, objectives);
	redObjs = addFrontline(redObjs, blueObjs, objectives);

	return [blueObjs, redObjs];
}
