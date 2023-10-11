import type * as DcsJs from "@foxdelta2/dcsjs";

import * as Domain from "../domain";
import { RunningCampaignState } from "./types";
import { getCoalitionFaction } from "./utils";

function cleanupFactionInventory(coalition: DcsJs.Coalition, state: RunningCampaignState) {
	const faction = getCoalitionFaction(coalition, state);

	Object.values(faction.inventory.aircrafts).forEach((aircraft) => {
		if (aircraft.alive) {
			return;
		}

		if (aircraft.destroyedTime == null) {
			return;
		}

		if (aircraft.destroyedTime <= state.timer - Domain.Time.Hours(12)) {
			if (
				faction.packages.some((pkg) =>
					pkg.flightGroups.some((fg) => fg.units.some((fgUnit) => fgUnit.id === aircraft.id)),
				)
			) {
				return;
			}

			delete faction.inventory.aircrafts[aircraft.id];
		}
	});

	Object.values(faction.inventory.groundUnits).forEach((unit) => {
		if (unit.alive) {
			return;
		}

		if (unit.destroyedTime == null) {
			return;
		}

		if (unit.destroyedTime <= state.timer - Domain.Time.Hours(12)) {
			if (
				faction.groundGroups.some(
					(gg) => gg.unitIds.some((id) => id === unit.id) || gg.shoradUnitIds.some((id) => id === unit.id),
				)
			) {
				return;
			}

			delete faction.inventory.groundUnits[unit.id];
		}
	});
}
export function cleanupInventory(state: RunningCampaignState) {
	cleanupFactionInventory("blue", state);
}
