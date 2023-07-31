import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import * as Domain from "../../domain";
import { Minutes, oppositeCoalition, random } from "../../utils";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction } from "../utils";

const destroySam = (faction: DcsJs.CampaignFaction, id: string, timer: number) => {
	faction.groundGroups.forEach((gg) => {
		if (gg.id === id && Domain.Faction.isSamGroup(gg)) {
			gg.operational = false;
			gg.unitIds.forEach((id) => {
				const unit = faction.inventory.groundUnits[id];
				if (unit == null) {
					return;
				}

				if (unit.vehicleTypes.some((vt) => vt === "Track Radar" || vt === "Search Radar")) {
					unit.alive = false;
					unit.destroyedTime = timer;
				}
			});
		}
	});
};

export const dead = (coalition: DcsJs.CampaignCoalition, state: RunningCampaignState) => {
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	faction.packages.forEach((pkg) => {
		if (pkg.startTime > state.timer) {
			return;
		}

		pkg.flightGroups.forEach((fg) => {
			if (fg.task === "DEAD" && fg.target != null) {
				const sam = oppFaction.groundGroups.find((gg) => gg.id === fg.target);

				if (sam == null) {
					return;
				}

				if (Utils.distanceToPosition(fg.position, sam.position) < 90_000 && fg.startTime + Minutes(1) < state.timer) {
					fg.units.forEach((unit) => {
						const aircraft = faction.inventory.aircrafts[unit.id];

						if (aircraft == null) {
							return;
						}

						if (aircraft.a2GWeaponReadyTimer == null || aircraft.a2GWeaponReadyTimer <= state.timer) {
							// Is the attack successful
							if (random(1, 100) <= 50) {
								destroySam(oppFaction, sam.id, state.timer);
								console.log(`DEAD: ${aircraft.id} destroyed SAM in objective ${sam.id}`); // eslint-disable-line no-console
							} else {
								console.log(`DEAD: ${aircraft.id} missed SAM in objective ${sam.id}`); // eslint-disable-line no-console
							}

							aircraft.a2GWeaponReadyTimer = state.timer + Minutes(60);
						}
					});
				}
			}
		});
	});
};
