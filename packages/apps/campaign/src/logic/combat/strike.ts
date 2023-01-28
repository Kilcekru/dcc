import * as DcsJs from "@foxdelta2/dcsjs";

import { distanceToPosition, getAircraftFromId, Minutes, random } from "../../utils";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction } from "../utils";

const destroyStructure = (objectives: Array<DcsJs.CampaignObjective>, name: string, timer: number) => {
	const objective = objectives.find((obj) => obj.name === name);

	if (objective == null) {
		return;
	}

	objective.structures.forEach((str) => {
		str.alive = false;
		str.destroyedTime = timer;
	});
};

export const strike = (coalition: DcsJs.CampaignCoalition, state: RunningCampaignState) => {
	const faction = getCoalitionFaction(coalition, state);

	faction.packages.forEach((pkg) => {
		pkg.flightGroups.forEach((fg) => {
			if (fg.task === "Pinpoint Strike") {
				const objective = fg.objective;

				if (objective == null) {
					return;
				}

				if (distanceToPosition(fg.position, objective.position) < 5_000 && fg.startTime + Minutes(1) < state.timer) {
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
								if (random(1, 100) <= 75) {
									destroyStructure(state.objectives, objective.name, state.timer);
									console.log(`Strike: ${aircraft.id} destroyed structures in objective ${objective.name}`); // eslint-disable-line no-console
								} else {
									console.log(`Strike: ${aircraft.id} missed structures in objective ${objective.name}`); // eslint-disable-line no-console
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
