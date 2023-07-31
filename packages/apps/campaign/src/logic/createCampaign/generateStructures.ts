import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import { Config, ObjectivePlan } from "../../data";
import { randomItem } from "../../utils";

function calcInitDeploymentScore(coalition: DcsJs.CampaignCoalition, structureType: DcsJs.StructureType) {
	if (coalition === "blue") {
		switch (structureType) {
			case "Barrack": {
				return Config.deploymentScore.frontline.barrack / Config.deploymentScore.frontline.initialFactor;
			}
			case "Depot": {
				return Config.deploymentScore.frontline.depot / Config.deploymentScore.frontline.initialFactor;
			}
		}
	}

	return 0;
}
export function generateStructures(
	coalition: DcsJs.CampaignCoalition,
	objectivePlans: Array<ObjectivePlan>,
	dataStore: Types.Campaign.DataStore,
) {
	const structures: Record<string, DcsJs.Structure> = {};

	if (dataStore.strikeTargets == null) {
		return structures;
	}

	const strikeTargets = Object.values(dataStore.strikeTargets);

	objectivePlans.forEach((plan) => {
		plan.structures.forEach((structurePlan) => {
			const strikeTarget = strikeTargets.reduce(
				(prev, objectiveTargets) => {
					const target = objectiveTargets.find((st) => st.name === structurePlan.structureName);

					if (target == null) {
						return prev;
					} else {
						return target;
					}
				},
				undefined as DcsJs.StrikeTarget | undefined,
			);

			if (strikeTarget == null) {
				return;
			}

			const structureType = structurePlan.structureType as DcsJs.StructureType;
			const structureTemplate = randomItem(dataStore.structures?.[structureType] ?? []);

			if (structureType === "Barrack" || structureType === "Depot") {
				const structure: DcsJs.StructureUnitCamp = {
					name: structurePlan.structureName,
					buildings:
						structureTemplate?.buildings.map((building, i) => ({
							alive: true,
							name: `${structurePlan.structureName}|${i + 1}`,
							...building,
							shapeName: building.shapeName ?? "",
						})) ?? [],
					groupId: strikeTarget.groupId,
					id: createUniqueId(),
					objectiveName: strikeTarget.objectiveName,
					position: strikeTarget.position,
					type: structureType,
					state: "active",
					deploymentScore: calcInitDeploymentScore(coalition, structureType),
				};

				structures[structurePlan.structureName] = structure;
			} else {
				const structure: DcsJs.StructureDefault = {
					name: structurePlan.structureName,
					buildings:
						structureTemplate?.buildings.map((building, i) => ({
							alive: true,
							name: `${structurePlan.structureName}|${i + 1}`,
							...building,
							shapeName: building.shapeName ?? "",
						})) ?? [],
					groupId: strikeTarget.groupId,
					id: createUniqueId(),
					objectiveName: strikeTarget.objectiveName,
					position: strikeTarget.position,
					type: structureType,
					state: "active",
				};

				structures[structurePlan.structureName] = structure;
			}
		});
	});

	return structures;
}
