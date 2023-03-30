import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import { ScenarioCoalition } from "../../data";
import { randomItem } from "../../utils";

export function generateAmmoDepots(scenarioCoalition: ScenarioCoalition, dataStore: DataStore) {
	return scenarioCoalition.ammoDepots.reduce((prev, structureName) => {
		if (dataStore.strikeTargets == null) {
			return prev;
		}
		const strikeTarget = Object.values(dataStore.strikeTargets).reduce((prev, objectiveTargets) => {
			const target = objectiveTargets.find((st) => st.name === structureName);

			if (target == null) {
				return prev;
			} else {
				return target;
			}
		}, undefined as DcsJs.StrikeTarget | undefined);

		if (strikeTarget == null) {
			return prev;
		}

		const depotTemplate = randomItem(dataStore.structures?.["Ammo Depot"] ?? []);

		prev[structureName] = {
			name: structureName,
			buildings: depotTemplate?.buildings.map((building, i) => ({
				alive: true,
				name: `${structureName}|${i + 1}`,
				...building,
			})),
			groupId: strikeTarget.groupId,
			id: createUniqueId(),
			objectiveName: strikeTarget.objectiveName,
			position: strikeTarget.position,
			structureType: "Ammo Depot",
			state: "active",
		} as DcsJs.CampaignStructure;

		return prev;
	}, {} as Record<string, DcsJs.CampaignStructure>);
}
