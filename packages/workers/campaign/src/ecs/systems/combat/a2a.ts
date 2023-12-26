import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import * as Entities from "../../entities";
import { store } from "../../store";

function battleRoundCoalition(coalition: DcsJs.Coalition) {
	const flightGroups = store.queries.flightGroups[coalition].intersection(store.queries.mapEntities);

	for (const flightGroup of flightGroups) {
		if (!flightGroup.isInCombat) {
			continue;
		}

		// Valid A2A combat parameters?
		if (
			flightGroup.combat != null &&
			flightGroup.a2aTarget != null &&
			flightGroup.combat.type === "a2a" &&
			flightGroup.combat.cooldownTime <= store.time
		) {
			// Is in range?
			const range = flightGroup.a2aRange;
			const distance = Utils.Location.distanceToPosition(flightGroup.position, flightGroup.a2aTarget.position);

			if (distance <= range * Utils.Config.combat.a2a.rangeMultiplier) {
				flightGroup.fireA2A(distance);
			}
		}
	}
}

function battleRound() {
	battleRoundCoalition("red");
	battleRoundCoalition("blue");
}

function engagePerCoalition(coalition: DcsJs.Coalition) {
	const mapEntities = store.queries.mapEntities;

	const flightGroups = store.queries.flightGroups[coalition].intersection(mapEntities);
	const oppFlightGroups = store.queries.flightGroups[Utils.Coalition.opposite(coalition)].intersection(mapEntities);

	for (const flightGroup of flightGroups) {
		if (flightGroup.isInCombat) {
			continue;
		}

		const [aircraft] = flightGroup.aircrafts;

		if (aircraft == null) {
			throw new Error("aircraft not found");
		}

		const range = aircraft.a2aRange;

		// Does the aircraft have any A2A weapons?
		if (range > 0) {
			const enemyFlightGroupsInRange = new Set<Entities.FlightGroup>();
			// Find all enemy aircraft within range
			for (const enemyFlightGroup of oppFlightGroups) {
				if (enemyFlightGroup.isInCombat) {
					continue;
				}

				const distance = Utils.Location.distanceToPosition(flightGroup.position, enemyFlightGroup.position);

				// Is the enemy within range?
				if (distance <= range) {
					const enemyDistance = Utils.Location.distanceToPosition(flightGroup.position, enemyFlightGroup.position);

					if (enemyDistance <= range) {
						enemyFlightGroupsInRange.add(enemyFlightGroup);
					}
				}
			}

			// If there are any enemy aircraft within range, engage them
			if (enemyFlightGroupsInRange.size > 0) {
				// If there is only one enemy flight group within range, engage it
				if (enemyFlightGroupsInRange.size === 1) {
					const [enemyFlightGroup] = enemyFlightGroupsInRange;

					if (enemyFlightGroup == null) {
						throw new Error("enemy flight group not found");
					}

					flightGroup.engageA2A(enemyFlightGroup);
					enemyFlightGroup.engageA2A(flightGroup);
				} else {
					// If there are more enemy flight groups within range, engage the first A2A flight group
					const a2aEnemyFlightGroups = new Set<Entities.FlightGroup>();

					for (const enemyFlightGroup of enemyFlightGroupsInRange) {
						if (enemyFlightGroup.task === "CAP" || enemyFlightGroup.task === "Escort") {
							a2aEnemyFlightGroups.add(enemyFlightGroup);
						}
					}

					if (a2aEnemyFlightGroups.size > 0) {
						const [enemyFlightGroup] = a2aEnemyFlightGroups;

						if (enemyFlightGroup == null) {
							throw new Error("enemy flight group not found");
						}

						flightGroup.engageA2A(enemyFlightGroup);
						enemyFlightGroup.engageA2A(flightGroup);
					} else {
						// If there are no A2A flight groups, engage the first flight group
						const [enemyFlightGroup] = enemyFlightGroupsInRange;

						if (enemyFlightGroup == null) {
							throw new Error("enemy flight group not found");
						}

						flightGroup.engageA2A(enemyFlightGroup);
						enemyFlightGroup.engageA2A(flightGroup);
					}
				}
			}
		}

		aircraft.loadout;
	}
}

function engage() {
	engagePerCoalition("red");
	engagePerCoalition("blue");
}

export function a2a() {
	engage();
	battleRound();
}
