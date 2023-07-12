import type * as DcsJs from "@foxdelta2/dcsjs";
import { createUniqueId } from "solid-js";

import * as Domain from "../../domain";
import { DynamicObjectivePlan } from "./utils";

export function generateGroundGroups(
	objectivePlans: Array<DynamicObjectivePlan>,
	faction: DcsJs.CampaignFaction,
	timer: number,
) {
	objectivePlans.forEach((op) => {
		if (op.groundUnitTypes.some((gut) => gut === "vehicles")) {
			const id = createUniqueId();
			const groupType = Domain.Utils.random(1, 100) > 40 ? "armor" : "infantry";

			const validGroundUnits = Object.values(faction.inventory.groundUnits)
				.filter((unit) => unit.category !== "Air Defence")
				.filter((unit) => {
					if (groupType === "infantry") {
						return unit.category === "Infantry" && unit.state === "idle";
					} else {
						return unit.category !== "Infantry" && unit.state === "idle";
					}
				});

			const units = Domain.Utils.randomList(validGroundUnits, Domain.Utils.random(4, 8));

			units.forEach((unit) => {
				const inventoryUnit = faction.inventory.groundUnits[unit.id];

				if (inventoryUnit == null) {
					console.error("inventory ground unit not found", unit.id); // eslint-disable-line no-console
					return;
				}

				inventoryUnit.state = "on objective";
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
