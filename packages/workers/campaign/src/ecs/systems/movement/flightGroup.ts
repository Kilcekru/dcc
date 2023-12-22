import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import * as Entities from "../../entities";
import { world } from "../../world";

export function takeOff(coalition: DcsJs.Coalition) {
	const flightGroups = world.queries.flightGroups[coalition];
	const mapEntities = world.queries.mapEntities;

	const waitingFlightGroups = flightGroups.difference(mapEntities);

	for (const flightGroup of waitingFlightGroups) {
		if (
			flightGroup.flightplan.currentWaypoint != null &&
			flightGroup.flightplan.currentWaypoint.type !== Entities.WaypointType.TakeOff
		) {
			flightGroup.takeOff();
		}
	}
}

export function land(coalition: DcsJs.Coalition) {
	const flightGroups = world.queries.flightGroups[coalition];
	const mapEntities = world.queries.mapEntities;

	const flyingFlightGroups = flightGroups.intersection(mapEntities);

	for (const flightGroup of flyingFlightGroups) {
		if (flightGroup.flightplan.currentWaypoint == null) {
			flightGroup.land();
		}
	}
}

export function move(worldDelta: number, coalition: DcsJs.Coalition) {
	const flightGroups = world.queries.flightGroups[coalition];
	const mapEntities = world.queries.mapEntities;

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
	const airAssaultFlightGroups = world.queries.flightGroups[coalition].get("Air Assault");

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
