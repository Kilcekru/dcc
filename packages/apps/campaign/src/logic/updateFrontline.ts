import { getUsableGroundUnits, oppositeCoalition, random } from "../utils";
import { RunningCampaignState } from "./types";
import { getCoalitionFaction } from "./utils";

export const updateFrontline = (state: RunningCampaignState) => {
	state.objectives.forEach((objective) => {
		// Are all frontline units destroyed
		if (objective.unitIds.length > 0) {
			const objectiveFaction = getCoalitionFaction(objective.coalition, state);
			const oppCoalition = oppositeCoalition(objective.coalition);
			const oppFaction = getCoalitionFaction(oppCoalition, state);
			const hasAliveUnits = objective.unitIds.some(
				(unitId) => objectiveFaction.inventory.groundUnits[unitId]?.alive === true
			);

			if (hasAliveUnits === false) {
				const availableGroundUnits = getUsableGroundUnits(oppFaction.inventory.groundUnits);

				if (availableGroundUnits.length >= 4) {
					objective.coalition = oppCoalition;

					const selectedUnits = availableGroundUnits.slice(0, random(4, 8));

					objective.unitIds = selectedUnits.map((u) => u.id);

					selectedUnits.forEach((u) => {
						const inventoryUnit = oppFaction.inventory.groundUnits[u.id];

						if (inventoryUnit == null) {
							return;
						}

						inventoryUnit.state = "on objective";
					});
				}
			}
		}
	});
};
