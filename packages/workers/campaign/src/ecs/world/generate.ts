import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import * as Entities from "../entities";

function getObjective(objectives: Set<Entities.Objective>, name: string) {
	for (const objective of objectives) {
		if (objective.name === name) {
			return objective;
		}
	}

	throw new Error(`getObjective: invalid name ${name}`);
}

export function generateAirdromes(args: {
	coalition: DcsJs.Coalition;
	airdromeNames: Array<string>;
	dataStore: Types.Campaign.DataStore;
}) {
	for (const name of args.airdromeNames) {
		const airdrome = args.dataStore.airdromes?.[name];

		if (airdrome == null) {
			throw new Error(`airdrome: ${name} not found`);
		}

		Entities.Airdrome.create({
			coalition: args.coalition,
			frequencyList: airdrome.frequencyList ?? [],
			name: airdrome.name,
			position: Utils.Location.objectToPosition(airdrome),
		});
	}
}

export function generateStructures(args: {
	coalition: DcsJs.Coalition;
	objectivePlans: Array<Types.Campaign.ObjectivePlan>;
	dataStore: Types.Campaign.DataStore;
	objectives: Set<Entities.Objective>;
}) {
	const strikeTargets = args.dataStore.strikeTargets;

	if (strikeTargets == null) {
		throw new Error("strikeTargets not found");
	}

	for (const plan of args.objectivePlans) {
		for (const structurePlan of plan.structures) {
			const strikeTarget = strikeTargets[plan.objectiveName]?.find((st) => st.name === structurePlan.structureName);

			if (strikeTarget == null) {
				// eslint-disable-next-line no-console
				console.warn("strikeTarget not found", {
					objectiveName: plan.objectiveName,
					structureName: structurePlan.structureName,
				});
				continue;
			}

			const structureType = structurePlan.structureType as DcsJs.StructureType;

			const objective = getObjective(args.objectives, plan.objectiveName);

			if (objective == null) {
				// eslint-disable-next-line no-console
				console.warn("objective not found", { objectiveName: plan.objectiveName });
				continue;
			}

			if (structureType === "Barrack" || structureType === "Depot") {
				Entities.UnitCamp.create({
					name: structurePlan.structureName,
					objective,
					position: strikeTarget.position,
					structureType,
					coalition: args.coalition,
				});
			} else {
				Entities.GenericStructure.create({
					name: structurePlan.structureName,
					objective,
					position: strikeTarget.position,
					structureType,
					coalition: args.coalition,
				});
			}
		}
	}
}

export function generateGroundGroups(args: {
	coalition: DcsJs.Coalition;
	objectivePlans: Array<Types.Campaign.ObjectivePlan>;
	objectives: Set<Entities.Objective>;
}) {
	for (const plan of args.objectivePlans) {
		if (plan.groundUnitTypes.some((gut) => gut === "vehicles")) {
			const obj = getObjective(args.objectives, plan.objectiveName);

			if (obj == null) {
				throw new Error(`Objective ${plan.objectiveName} not found`);
			}

			Entities.GroundGroup.create({
				coalition: args.coalition,
				start: obj,
				target: obj,
			});
		}
	}
}

export function generateObjectives(args: {
	blueOps: Array<Types.Campaign.DynamicObjectivePlan>;
	redOps: Array<Types.Campaign.DynamicObjectivePlan>;
	dataStore: Types.Campaign.DataStore;
}) {
	const objectives = args.dataStore.objectives;
	if (objectives == null) {
		throw new Error("createObjectives: dataStore is not fetched");
	}

	for (const objective of objectives) {
		const isBlue = args.blueOps.some((obj) => obj.objectiveName === objective.name);
		const isRed = args.redOps.some((obj) => obj.objectiveName === objective.name);

		if (!isBlue && !isRed) {
			continue;
		}

		Entities.Objective.create({
			coalition: isBlue ? "blue" : "red",
			name: objective.name,
			position: objective.position,
		});
	}
}
