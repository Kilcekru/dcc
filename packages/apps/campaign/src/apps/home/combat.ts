import type * as DcsJs from "@foxdelta2/dcsjs";
import { useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { useFaction } from "../../hooks";
import {
	distanceToPosition,
	getActiveWaypoint,
	getAircraftFromId,
	getFlightGroups,
	Minutes,
	random,
} from "../../utils";

const useCasA2G = (coalition: DcsJs.CampaignCoalition) => {
	const [state, { destroyUnit, updateActiveAircrafts }] = useContext(CampaignContext);
	const faction = useFaction(coalition);

	return () => {
		const fgs = getFlightGroups(faction?.packages);

		const onStationCASfgs = fgs.filter((fg) => fg.task === "CAS" && getActiveWaypoint(fg, state.timer)?.name === "CAS");

		const updatedAircraft: Array<DcsJs.CampaignAircraft> = [];

		onStationCASfgs.forEach((fg) => {
			fg.aircraftIds.forEach((id) => {
				const aircraft = getAircraftFromId(faction?.inventory.aircrafts, id);

				if (aircraft == null) {
					throw "aircraft not found";
				}

				// Init arrival
				if (aircraft.weaponReadyTimer == null) {
					updatedAircraft.push({ ...aircraft, weaponReadyTimer: state.timer + Minutes(3) });
				} else if (aircraft.weaponReadyTimer <= state.timer) {
					const fgObjective = state.objectives.find((obj) => fg.objective?.name === obj.name);

					if (fgObjective == null) {
						throw "objective not found";
					}

					const aliveUnits = fgObjective.units.find((unit) => unit.alive === true);

					if (aliveUnits != null) {
						// Is the attack successful
						if (random(1, 100) <= 50) {
							destroyUnit?.(coalition === "blue" ? "redFaction" : "blueFaction", fgObjective.name, aliveUnits.id);
							console.log(`CAS: ${aircraft.id} destroyed ${aliveUnits.id} in objective ${fgObjective.name}`); // eslint-disable-line no-console
						} else {
							console.log(`CAS: ${aircraft.id} missed ${aliveUnits.id} in objective ${fgObjective.name}`); // eslint-disable-line no-console
						}

						updatedAircraft.push({ ...aircraft, weaponReadyTimer: state.timer + Minutes(3) });
					}
				}
			});
		});

		if (updatedAircraft.length > 0) {
			updateActiveAircrafts?.(coalition === "blue" ? "blueFaction" : "redFaction", updatedAircraft);
		}
	};
};

const useDead = (coalition: DcsJs.CampaignCoalition) => {
	const [state, { destroySam, updateActiveAircrafts }] = useContext(CampaignContext);
	const faction = useFaction(coalition);

	return () => {
		const fgs = getFlightGroups(faction?.packages);

		const updatedAircraft: Array<DcsJs.CampaignAircraft> = [];

		const deadFgs = fgs.filter((fg) => fg.task === "DEAD");

		deadFgs.forEach((fg) => {
			const objective = fg.objective;

			if (
				objective != null &&
				distanceToPosition(fg.position, objective.position) < 90_000 &&
				fg.startTime + Minutes(3) < state.timer
			) {
				fg.aircraftIds.forEach((id) => {
					const aircraft = getAircraftFromId(faction?.inventory.aircrafts, id);

					if (aircraft == null) {
						throw "aircraft not found";
					}

					if (aircraft.weaponReadyTimer == null || aircraft.weaponReadyTimer <= state.timer) {
						// Is the attack successful
						if (random(1, 100) <= 50) {
							destroySam?.(coalition === "blue" ? "redFaction" : "blueFaction", objective.name);
							console.log(`DEAD: ${aircraft.id} destroyed SAM in objective ${objective.name}`); // eslint-disable-line no-console
						} else {
							console.log(`DEAD: ${aircraft.id} missed SAM in objective ${objective.name}`); // eslint-disable-line no-console
						}

						updatedAircraft.push({ ...aircraft, weaponReadyTimer: state.timer + Minutes(60) });
					}
				});
			}
		});

		if (updatedAircraft.length > 0) {
			updateActiveAircrafts?.(coalition === "blue" ? "blueFaction" : "redFaction", updatedAircraft);
		}
	};
};

export const useCombat = () => {
	const blueCasA2G = useCasA2G("blue");
	const redCasA2G = useCasA2G("red");
	const blueDead = useDead("blue");
	const redDead = useDead("red");

	return () => {
		blueCasA2G();
		redCasA2G();
		blueDead();
		redDead();
	};
};
