import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import * as Entities from "../../entities";
import { WaypointType } from "../../objects";
import { store } from "../../store";

export function takeOff(coalition: DcsJs.Coalition) {
	const flightGroups = store.queries.flightGroups[coalition];
	const mapEntities = store.queries.mapEntities;

	const waitingFlightGroups = flightGroups.difference(mapEntities);

	for (const flightGroup of waitingFlightGroups) {
		if (
			flightGroup.flightplan.currentWaypoint != null &&
			flightGroup.flightplan.currentWaypoint.type !== WaypointType.TakeOff
		) {
			flightGroup.takeOff();
		}
	}
}

export function land(coalition: DcsJs.Coalition) {
	const flightGroups = store.queries.flightGroups[coalition];
	const mapEntities = store.queries.mapEntities;

	const flyingFlightGroups = flightGroups.intersection(mapEntities);

	for (const flightGroup of flyingFlightGroups) {
		if (flightGroup.flightplan.currentWaypoint == null) {
			flightGroup.land();
		}
	}
}

export function move(worldDelta: number, coalition: DcsJs.Coalition) {
	const flightGroups = store.queries.flightGroups[coalition];
	const mapEntities = store.queries.mapEntities;

	const flyingFlightGroups = flightGroups.intersection(mapEntities);

	for (const flightGroup of flyingFlightGroups) {
		if (flightGroup.flightplan.currentWaypoint == null) {
			continue;
		}
		flightGroup.move(worldDelta);
	}
}

/**
 * Disembark ground groups if they reached the target
 * @param coalition
 */
export function disembark(coalition: DcsJs.Coalition) {
	const airAssaultFlightGroups = store.queries.flightGroups[coalition].get("Air Assault");

	for (const flightGroup of airAssaultFlightGroups) {
		if (flightGroup instanceof Entities.AirAssaultFlightGroup) {
			if (flightGroup.hasEmbarkedGroundGroup) {
				const distance = Utils.Location.distanceToPosition(flightGroup.position, flightGroup.target.position);

				if (distance < 500) {
					flightGroup.unloadGroundGroup();
				}
			}
		}
	}
}
