import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import * as Domain from "../../domain";
import { generateGroundGroupInventory } from "./generateGroundUnitsInventory";
import { DynamicObjectivePlan } from "./utils";

export function generateGroundGroups(
	objectivePlans: Array<DynamicObjectivePlan>,
	faction: DcsJs.CampaignFaction,
	timer: number,
	dataStore: Types.Campaign.DataStore,
) {
	objectivePlans.forEach((op) => {
		if (op.groundUnitTypes.some((gut) => gut === "vehicles")) {
			const id = createUniqueId();
			const groupType = Domain.Utils.random(1, 100) > 40 ? "armor" : "infantry";

			const units = generateGroundGroupInventory(faction, dataStore, groupType);

			// update inventory
			units.forEach((u) => {
				faction.inventory.groundUnits[u.id] = {
					...u,
					state: "on objective",
				};
			});

			faction.groundGroups.push({
				id,
				name: op.objectiveName + "-" + id,
				objectiveName: op.objectiveName,
				startObjectiveName: op.objectiveName,
				position: op.objective.position,
				state: "on objective",
				unitIds: units.map((u) => u.id),
				startTime: timer,
				type: groupType,
			});
		}
	});
}
