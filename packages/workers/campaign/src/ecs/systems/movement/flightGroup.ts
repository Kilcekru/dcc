import * as DcsJs from "@foxdelta2/dcsjs";

import { WaypointType } from "../../entities/Waypoint";
import { world } from "../../world";

export function takeOff(coalition: DcsJs.Coalition) {
	const flightGroups = world.queries.flightGroups[coalition];
	const mapEntities = world.queries.mapEntities;

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
