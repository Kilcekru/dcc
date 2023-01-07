import type * as DcsJs from "@foxdelta2/dcsjs";
import { useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { useFaction } from "../../hooks";
import { getActiveWaypoint, getAircraftFromId, getFlightGroups, Minutes, random } from "../../utils";

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

export const useCombat = () => {
	const blueCasA2G = useCasA2G("blue");
	const redCasA2G = useCasA2G("red");

	return () => {
		blueCasA2G();
		redCasA2G();
	};
};
