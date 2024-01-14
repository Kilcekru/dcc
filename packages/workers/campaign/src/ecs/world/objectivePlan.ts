import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import * as Entities from "../entities";

type Lane = {
	current: DcsJs.Position | undefined;
	target: DcsJs.Position;
};

function generateLanes(startPositions: Array<Entities.Airdrome>, targetPositions: Array<Entities.Airdrome>) {
	const lanes: Array<Lane> = [];

	startPositions.forEach(({ position: start }) => {
		targetPositions.forEach(({ position: target }) => {
			if (Utils.Location.distanceToPosition(start, target) < 200_000) {
				lanes.push({ current: start, target: target });
			}
		});
	});

	return lanes;
}

function selectObjective(
	sourcePosition: DcsJs.Position,
	targetPosition: DcsJs.Position,
	objectives: Array<DcsJs.Objective>,
) {
	const sourceDistance = Utils.Location.distanceToPosition(sourcePosition, targetPosition);

	const nearbyObjectives = Utils.Location.findInside(objectives, sourcePosition, (obj) => obj.position, 20_000);

	const forwardObjectives = nearbyObjectives.filter((obj) => {
		const objDistance = Utils.Location.distanceToPosition(obj.position, targetPosition);

		return objDistance < sourceDistance && objDistance > 20_000;
	});

	const selectedObjective = Utils.Random.item(forwardObjectives);

	return selectedObjective;
}

function addObjectivePlan(
	objectivePlans: Array<Types.Campaign.DynamicObjectivePlan>,
	objective: DcsJs.Objective,
	groundUnit?: string,
	structure?: Types.Campaign.StructurePlan,
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
	objectivePlans: Array<Types.Campaign.DynamicObjectivePlan>,
	oppObjectivePlans: Array<Types.Campaign.DynamicObjectivePlan>,
	objectives: Array<DcsJs.Objective>,
) {
	lanes.forEach((lane) => {
		if (lane.current == null) {
			return;
		}

		const selectedObjective = selectObjective(lane.current, lane.target, objectives);

		if (selectedObjective != null) {
			objectivePlans = addObjectivePlan(objectivePlans, selectedObjective);

			const oppObjectivesInRange = Utils.Location.findInside(
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
	bluePlans: Array<Types.Campaign.DynamicObjectivePlan>,
	redPlans: Array<Types.Campaign.DynamicObjectivePlan>,
	objectives: Array<DcsJs.Objective>,
): [Array<Types.Campaign.DynamicObjectivePlan>, Array<Types.Campaign.DynamicObjectivePlan>] {
	let blue = bluePlans;
	let red = redPlans;

	objectives.forEach((obj) => {
		const isBlue = bluePlans.some((plan) => plan.objectiveName === obj.name);
		const isRed = redPlans.some((plan) => plan.objectiveName === obj.name);

		if (isBlue || isRed) {
			return;
		}

		const nearestBlue = Utils.Location.findNearest(bluePlans, obj.position, (op) => op.objective.position);
		const nearestRed = Utils.Location.findNearest(redPlans, obj.position, (op) => op.objective.position);

		const distanceBlue =
			nearestBlue == null
				? 999_999_999
				: Utils.Location.distanceToPosition(nearestBlue.objective.position, obj.position);
		const distanceRed =
			nearestRed == null ? 999_999_999 : Utils.Location.distanceToPosition(nearestRed.objective.position, obj.position);

		if (distanceBlue <= distanceRed) {
			blue = addObjectivePlan(blue, obj);
		} else {
			red = addObjectivePlan(red, obj);
		}
	});

	return [blue, red];
}

function addAirdromeSamObjectives(
	airdromes: Array<Entities.Airdrome>,
	oppAirdromes: Array<Entities.Airdrome>,
	targets: Record<string, DcsJs.Target[]>,
	objectives: Array<DcsJs.Objective>,
	objectivePlans: Array<Types.Campaign.DynamicObjectivePlan>,
) {
	airdromes.forEach((airdrome) => {
		const oppAirdrome = Utils.Location.findNearest(oppAirdromes, airdrome.position, (ad) =>
			Utils.Location.objectToPosition(ad),
		);

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

		const nearbyObjectives = Utils.Location.findInside(
			validObjectives,
			airdrome.position,
			(obj) => obj.position,
			20_000,
		);
		const sourceDistance = Utils.Location.distanceToPosition(airdrome.position, oppAirdrome.position);

		const forwardObjectives = nearbyObjectives.filter((obj) => {
			const objDistance = Utils.Location.distanceToPosition(obj.position, oppAirdrome.position);

			return objDistance < sourceDistance && objDistance > 30_000;
		});

		const selectedObjective = Utils.Random.item(forwardObjectives);

		if (selectedObjective == null) {
			const farEnoughFromOppAirdrome = nearbyObjectives.filter((obj) => {
				const objDistance = Utils.Location.distanceToPosition(obj.position, oppAirdrome.position);

				return objDistance > 30_000;
			});

			const fallbackObjective = Utils.Random.item(farEnoughFromOppAirdrome);

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
	targets,
	range,
}: {
	sourcePosition: DcsJs.Position;
	objectivePlans: Array<Types.Campaign.DynamicObjectivePlan>;
	oppObjectivePlans: Array<Types.Campaign.DynamicObjectivePlan>;
	objectives: Array<DcsJs.Objective>;
	targets: Record<string, Array<DcsJs.Target>>;
	range: number;
}) {
	const objectivesInRange = Utils.Location.findInside(objectives, sourcePosition, (obj) => obj.position, range);

	const freeObjectives = objectivesInRange.filter((obj) => {
		const plan = objectivePlans.find((op) => op.objectiveName === obj.name);
		const target = targets[obj.name];

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
		const nearestCoalition = Utils.Location.findNearest(objectivePlans, obj.position, (op) => op.objective.position);
		const nearestOpp = Utils.Location.findNearest(oppObjectivePlans, obj.position, (op) => op.objective.position);

		if (nearestCoalition == null) {
			return false;
		}

		if (nearestOpp == null) {
			return true;
		}

		const coalitionDistance = Utils.Location.distanceToPosition(nearestCoalition.objective.position, obj.position);
		const oppDistance = Utils.Location.distanceToPosition(nearestOpp.objective.position, obj.position);

		return coalitionDistance <= oppDistance;
	});

	return Utils.Random.item(friendlyObjectives);
}

function addStructures({
	objectivePlans,
	oppObjectivePlans,
	objectives,
	targets,
	range,
	structureType,
}: {
	objectivePlans: Array<Types.Campaign.DynamicObjectivePlan>;
	oppObjectivePlans: Array<Types.Campaign.DynamicObjectivePlan>;
	objectives: Array<DcsJs.Objective>;
	targets: Record<string, Array<DcsJs.Target>>;
	range: number;
	structureType: DcsJs.StructureType;
}) {
	objectivePlans.forEach((plan) => {
		const existingStructures = objectivePlans.filter((op) =>
			op.structures.some((str) => str.structureType === structureType),
		);

		const existingStructuresInRange = Utils.Location.findInside(
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
			targets,
			range,
		});

		if (selectedObjective == null) {
			return;
		}

		const structureName = targets[selectedObjective.name]?.find(
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
	targets,
}: {
	coalition: DcsJs.Coalition;
	objectivePlans: Array<Types.Campaign.DynamicObjectivePlan>;
	oppObjectivePlans: Array<Types.Campaign.DynamicObjectivePlan>;
	objectives: Array<DcsJs.Objective>;
	targets: Record<string, Array<DcsJs.Target>>;
}) {
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		targets,
		range: Utils.Config.structureRange.frontline.depot * Utils.Config.structureRange.generateRangeMultiplier[coalition],
		structureType: "Depot",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		targets,
		range:
			Utils.Config.structureRange.frontline.barrack * Utils.Config.structureRange.generateRangeMultiplier[coalition],
		structureType: "Barrack",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		targets,
		range: Utils.Config.structureRange.power * Utils.Config.structureRange.generateRangeMultiplier[coalition],
		structureType: "Power Plant",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		targets,
		range: Utils.Config.structureRange.ammo * Utils.Config.structureRange.generateRangeMultiplier[coalition],
		structureType: "Ammo Depot",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		targets,
		range: Utils.Config.structureRange.fuel * Utils.Config.structureRange.generateRangeMultiplier[coalition],
		structureType: "Fuel Storage",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		targets,
		range: Utils.Config.structureRange.hospital * Utils.Config.structureRange.generateRangeMultiplier[coalition],
		structureType: "Hospital",
	});
	objectivePlans = addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		targets,
		range: Utils.Config.structureRange.frontline.farp * Utils.Config.structureRange.generateRangeMultiplier[coalition],
		structureType: "Farp",
	});

	return objectivePlans;
}

function addFrontline(
	objectivePlans: Array<Types.Campaign.DynamicObjectivePlan>,
	oppObjectivePlans: Array<Types.Campaign.DynamicObjectivePlan>,
	objectives: Array<DcsJs.Objective>,
) {
	objectives.forEach((obj) => {
		const nearestFriendly = Utils.Location.findNearest(objectivePlans, obj.position, (op) => op.objective.position);

		const nearestOpp = Utils.Location.findNearest(oppObjectivePlans, obj.position, (op) => op.objective.position);

		if (nearestOpp == null || nearestFriendly == null) {
			return;
		}

		const distanceFriendly = Utils.Location.distanceToPosition(obj.position, nearestFriendly.objective.position);
		const distanceOpp = Utils.Location.distanceToPosition(obj.position, nearestOpp.objective.position);

		if (distanceOpp <= Utils.Config.structureRange.frontline.barrack && distanceFriendly < distanceOpp) {
			objectivePlans = addObjectivePlan(objectivePlans, obj, "vehicles");
		}
	});

	return objectivePlans;
}

export function generateObjectivePlans({
	blueAirdromes,
	redAirdromes,
	blueRange,
	theatre,
}: {
	blueAirdromes: Array<Entities.Airdrome>;
	redAirdromes: Array<Entities.Airdrome>;
	blueRange: [number, number];
	theatre: DcsJs.Theatre;
}): [Array<Types.Campaign.DynamicObjectivePlan>, Array<Types.Campaign.DynamicObjectivePlan>] {
	const objectives = DcsJs.Theatres[theatre].objectives?.filter(
		(obj) => obj.type === "Town" || obj.type === "Terrain" || obj.type === "POI",
	);
	const targets = DcsJs.Theatres[theatre].targets;

	if (objectives == null) {
		throw new Error("generateObjectivePlans: no objectives found");
	}

	if (targets == null) {
		throw new Error("generateObjectivePlans: no strike targets found");
	}

	let endOfLine = false;
	const blueLanes = generateLanes(blueAirdromes, redAirdromes);
	const redLanes = generateLanes(redAirdromes, blueAirdromes);

	let blueObjs: Array<Types.Campaign.DynamicObjectivePlan> = [];
	const maxBlueObjsCount = Utils.Random.number(blueRange[0], blueRange[1]);
	let redObjs: Array<Types.Campaign.DynamicObjectivePlan> = [];

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

	const samObjectives = objectives.filter((obj) => targets[obj.name]?.some((st) => st.type === "SAM"));

	blueObjs = addAirdromeSamObjectives(blueAirdromes, redAirdromes, targets, samObjectives, blueObjs);
	redObjs = addAirdromeSamObjectives(redAirdromes, blueAirdromes, targets, samObjectives, redObjs);

	blueObjs = generateFactionStructures({
		coalition: "blue",
		objectivePlans: blueObjs,
		objectives,
		oppObjectivePlans: redObjs,
		targets: targets,
	});

	redObjs = generateFactionStructures({
		coalition: "red",
		objectivePlans: redObjs,
		objectives,
		oppObjectivePlans: blueObjs,
		targets: targets,
	});

	blueObjs = addFrontline(blueObjs, redObjs, objectives);
	redObjs = addFrontline(redObjs, blueObjs, objectives);

	return [blueObjs, redObjs];
}
