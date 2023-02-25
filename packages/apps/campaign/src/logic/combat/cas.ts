import * as DcsJs from "@foxdelta2/dcsjs";

import { distanceToPosition, Minutes, oppositeCoalition, random } from "../../utils";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction } from "../utils";

const destroyUnit = (faction: DcsJs.CampaignFaction, id: string, timer: number) => {
	const inventoryUnit = faction.inventory.groundUnits[id];

	if (inventoryUnit == null) {
		return;
	}

	inventoryUnit.alive = false;
	inventoryUnit.destroyedTime = timer;
};
export const cas = (coalition: DcsJs.CampaignCoalition, state: RunningCampaignState) => {
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	faction.packages.forEach((pkg) => {
		pkg.flightGroups.forEach((fg) => {
			if (fg.task === "CAS" && fg.target != null) {
				const gg = oppFaction.groundGroups.find((gg) => gg.id === fg.target);

				if (gg != null && distanceToPosition(fg.position, gg?.position) < 3_000) {
					fg.units.forEach((unit) => {
						const aircraft = faction.inventory.aircrafts[unit.id];

						if (aircraft == null) {
							return;
						}

						if (aircraft.weaponReadyTimer == null) {
							aircraft.weaponReadyTimer = state.timer + Minutes(3);
						} else if (aircraft.weaponReadyTimer <= state.timer) {
							const aliveUnitId = gg.unitIds.find((id) => {
								const inventoryUnit = oppFaction.inventory.groundUnits[id];

								return inventoryUnit?.alive;
							});

							if (aliveUnitId == null) {
								return;
							}

							if (random(1, 100) <= 50) {
								destroyUnit(oppFaction, aliveUnitId, state.timer);
								console.log(`CAS: ${aircraft.id} destroyed ${aliveUnitId} in objective ${gg.objective.name}`); // eslint-disable-line no-console
							} else {
								console.log(`CAS: ${aircraft.id} missed ${aliveUnitId} in objective ${gg.objective.name}`); // eslint-disable-line no-console
							}

							aircraft.weaponReadyTimer = state.timer + Minutes(3);
						}
					});
				}
			}
		});
	});
};
