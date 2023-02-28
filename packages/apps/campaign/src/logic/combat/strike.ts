import * as DcsJs from "@foxdelta2/dcsjs";

import { distanceToPosition, Minutes, random } from "../../utils";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction } from "../utils";

const destroyStructure = (state: RunningCampaignState, structure: DcsJs.CampaignStructure) => {
	const objective = state.objectives[structure.objectiveName];

	if (objective == null) {
		// eslint-disable-next-line no-console
		console.error("destroy structure: objective not found", name);
		return;
	}

	const objStructure = objective.structures.find((str) => str.id === structure.id);

	if (objStructure == null) {
		// eslint-disable-next-line no-console
		console.error("destroy structure: structure not found", structure.id);
		return;
	}

	const objBuilding = objStructure.buildings.find((building) => building.alive);

	if (objBuilding == null) {
		// eslint-disable-next-line no-console
		console.error("destroy structure: building not found", structure.id);
		return;
	}

	objBuilding.alive = false;
	objBuilding.destroyedTime = state.timer;

	const building = structure.buildings.find((b) => b.name === objBuilding.name);

	if (building == null) {
		// eslint-disable-next-line no-console
		console.error("destroy structure: building not found", structure.id);
		return;
	}

	building.alive = false;
	building.destroyedTime = state.timer;
};

export const strike = (coalition: DcsJs.CampaignCoalition, state: RunningCampaignState) => {
	const faction = getCoalitionFaction(coalition, state);

	faction.packages.forEach((pkg) => {
		pkg.flightGroups.forEach((fg) => {
			if (fg.task === "Pinpoint Strike") {
				const fgObjective = fg.objective;

				if (fgObjective == null) {
					return;
				}

				if (distanceToPosition(fg.position, fgObjective.position) < 5_000 && fg.startTime + Minutes(1) < state.timer) {
					fg.units.forEach((unit) => {
						const aircraft = faction.inventory.aircrafts[unit.id];

						if (aircraft == null) {
							return;
						}

						if (aircraft.weaponReadyTimer == null || aircraft.weaponReadyTimer <= state.timer) {
							const structure = fgObjective.structures.find((str) =>
								str.buildings.find((building) => building.alive === true)
							);

							if (structure == null) {
								return;
							}

							// Is the attack successful
							if (random(1, 100) <= 75) {
								destroyStructure(state, structure);
								console.log(`Strike: ${aircraft.id} destroyed structure ${structure.name}`); // eslint-disable-line no-console
							} else {
								console.log(`Strike: ${aircraft.id} missed structure ${structure.name}`); // eslint-disable-line no-console
							}

							aircraft.weaponReadyTimer = state.timer + Minutes(60);
						}
					});
				}
			}
		});
	});
};
