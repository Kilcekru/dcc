import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import { ScenarioCoalition } from "../../data";
import { randomItem } from "../../utils";

export function generateStructures(scenarioCoalition: ScenarioCoalition, dataStore: DataStore) {
	const structures: Record<string, DcsJs.CampaignStructure> = {};

	if (dataStore.strikeTargets == null) {
		return structures;
	}

	const strikeTargets = Object.values(dataStore.strikeTargets);

	scenarioCoalition.objectivePlans.forEach((plan) => {
		plan.structures.forEach((structurePlan) => {
			const strikeTarget = strikeTargets.reduce((prev, objectiveTargets) => {
				const target = objectiveTargets.find((st) => st.name === structurePlan.structureName);

				if (target == null) {
					return prev;
				} else {
					return target;
				}
			}, undefined as DcsJs.StrikeTarget | undefined);

			if (strikeTarget == null) {
				return;
			}

			const structureType = structurePlan.structureType as DcsJs.StructureType;
			const structureTemplate = randomItem(dataStore.structures?.[structureType] ?? []);

			if (structureType === "Barrack" || structureType === "Depot") {
				const structure: DcsJs.CampaignStructureUnitCamp = {
					name: structurePlan.structureName,
					buildings:
						structureTemplate?.buildings.map((building, i) => ({
							alive: true,
							name: `${structurePlan.structureName}|${i + 1}`,
							...building,
						})) ?? [],
					groupId: strikeTarget.groupId,
					id: createUniqueId(),
					objectiveName: strikeTarget.objectiveName,
					position: strikeTarget.position,
					structureType: structureType,
					state: "active",
					deploymentScore: 0,
				};

				structures[structurePlan.structureName] = structure;
			} else {
				const structure: DcsJs.CampaignStructureDefault = {
					name: structurePlan.structureName,
					buildings:
						structureTemplate?.buildings.map((building, i) => ({
							alive: true,
							name: `${structurePlan.structureName}|${i + 1}`,
							...building,
						})) ?? [],
					groupId: strikeTarget.groupId,
					id: createUniqueId(),
					objectiveName: strikeTarget.objectiveName,
					position: strikeTarget.position,
					structureType: structureType,
					state: "active",
				};

				structures[structurePlan.structureName] = structure;
			}
		});
	});

	return structures;
}
