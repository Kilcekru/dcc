import type * as DcsJs from "@foxdelta2/dcsjs";
import { useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { useFaction } from "../../hooks";
import {
	coalitionToFactionString,
	distanceToPosition,
	findInside,
	getActiveWaypoint,
	getAircraftFromId,
	getFlightGroups,
	Minutes,
	oppositeCoalition,
	random,
	randomItem,
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

const useStrike = (coalition: DcsJs.CampaignCoalition) => {
	const [state, { destroyStructure, updateActiveAircrafts }] = useContext(CampaignContext);
	const faction = useFaction(coalition);

	return () => {
		const fgs = getFlightGroups(faction?.packages);

		const updatedAircraft: Array<DcsJs.CampaignAircraft> = [];

		const strikeFgs = fgs.filter((fg) => fg.task === "Pinpoint Strike");

		strikeFgs.forEach((fg) => {
			const objective = fg.objective;

			if (
				objective != null &&
				distanceToPosition(fg.position, objective.position) < 5_000 &&
				fg.startTime + Minutes(3) < state.timer
			) {
				fg.aircraftIds.forEach((id) => {
					const aircraft = getAircraftFromId(faction?.inventory.aircrafts, id);

					if (aircraft == null) {
						throw "aircraft not found";
					}

					if (aircraft.weaponReadyTimer == null || aircraft.weaponReadyTimer <= state.timer) {
						// Is the attack successful
						if (random(1, 100) <= 75) {
							destroyStructure?.(objective.name);
							console.log(`Strike: ${aircraft.id} destroyed structures in objective ${objective.name}`); // eslint-disable-line no-console
						} else {
							console.log(`Strike: ${aircraft.id} missed structures in objective ${objective.name}`); // eslint-disable-line no-console
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

const useSAM = (coalition: DcsJs.CampaignCoalition) => {
	const [state, { destroyAircraft }] = useContext(CampaignContext);
	const faction = useFaction(coalition);
	const oppFaction = useFaction(oppositeCoalition(coalition));

	return () => {
		const sams = faction?.sams.filter((sam) => sam.operational === true && sam.weaponReadyTimer <= state.timer);

		sams?.forEach((sam) => {
			const validAircrafts = oppFaction?.inventory.aircrafts.filter(
				(ac) => ac.alive === true && ac.state !== "idle" && ac.state !== "maintenance"
			);
			const aircraftsInRange = findInside(validAircrafts, sam.position, (ac) => ac.position, sam.range);

			const target = randomItem(aircraftsInRange);

			if (target == null) {
				return;
			}

			if (random(1, 100) <= 50) {
				destroyAircraft?.(coalitionToFactionString(oppositeCoalition(coalition)), target.id);
				console.log(`SAM: ${sam.id} destroyed aircraft ${target.id}`); // eslint-disable-line no-console
			} else {
				console.log(`SAM: ${sam.id} missed aircraft ${target.id}`); // eslint-disable-line no-console
			}
		});
	};
};

export const useCombat = () => {
	const blueCasA2G = useCasA2G("blue");
	const redCasA2G = useCasA2G("red");
	const blueDead = useDead("blue");
	const redDead = useDead("red");
	const blueStrike = useStrike("blue");
	const redStrike = useStrike("red");
	const blueSAM = useSAM("blue");
	const redSAM = useSAM("red");

	return () => {
		blueCasA2G();
		redCasA2G();
		blueDead();
		redDead();
		blueStrike();
		redStrike();
		blueSAM();
		redSAM();
	};
};
