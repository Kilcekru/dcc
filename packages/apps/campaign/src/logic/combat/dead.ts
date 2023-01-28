import * as DcsJs from "@foxdelta2/dcsjs";

import { distanceToPosition, getAircraftFromId, Minutes, oppositeCoalition, random } from "../../utils";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction } from "../utils";

const destroySam = (faction: DcsJs.CampaignFaction, id: string, timer: number) => {
	faction.sams.forEach((sam) => {
		if (sam.id === id) {
			sam.operational = false;
			sam.units.forEach((unit) => {
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
		pkg.flightGroups.forEach((fg) => {
			if (fg.task === "DEAD") {
				const objective = fg.objective;

				if (objective == null) {
					return;
				}

				if (distanceToPosition(fg.position, objective.position) < 90_000 && fg.startTime + Minutes(1) < state.timer) {
					fg.units.forEach((unit) => {
						const aircraft = getAircraftFromId(faction.inventory.aircrafts, unit.id);

						if (aircraft == null) {
							return;
						}

						fg.units.forEach((unit) => {
							const aircraft = getAircraftFromId(faction?.inventory.aircrafts, unit.id);

							if (aircraft == null) {
								throw "aircraft not found";
							}

							if (aircraft.weaponReadyTimer == null || aircraft.weaponReadyTimer <= state.timer) {
								// Is the attack successful
								if (random(1, 100) <= 50) {
									destroySam(oppFaction, objective.name, state.timer);
									console.log(`DEAD: ${aircraft.id} destroyed SAM in objective ${objective.name}`); // eslint-disable-line no-console
								} else {
									console.log(`DEAD: ${aircraft.id} missed SAM in objective ${objective.name}`); // eslint-disable-line no-console
								}

								aircraft.weaponReadyTimer = state.timer + Minutes(60);
							}
						});
					});
				}
			}
		});
	});
};
