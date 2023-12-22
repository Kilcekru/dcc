import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { world } from "../../world";
import { HoldWaypoint, WaypointTemplate } from "../Waypoint";
import { FlightGroup, FlightGroupProps } from "./FlightGroup";

interface EscortingFlightGroupProps extends Omit<FlightGroupProps, "task"> {
	targetFlightGroupId: Types.Campaign.Id;
	holdWaypoint: HoldWaypoint;
}

export class EscortingFlightGroup extends FlightGroup {
	readonly #targetFlightGroupId: Types.Campaign.Id;

	get target() {
		return world.getEntity<FlightGroup>(this.#targetFlightGroupId);
	}

	protected constructor(args: EscortingFlightGroupProps) {
		super({ ...args, task: "CAP" });
		this.#targetFlightGroupId = args.targetFlightGroupId;
		const prevWaypoint = Utils.Array.lastItem(args.taskWaypoints);

		if (prevWaypoint == null) {
			throw new Error("prevWaypoint is null");
		}
		this.flightplan.add(WaypointTemplate.takeOffWaypoint(args.homeBase));
		this.flightplan.add(...args.taskWaypoints);
		this.flightplan.add(
			...WaypointTemplate.landingWaypoints({
				prevWaypoint,
				homeBase: args.homeBase,
			}),
		);
	}

	static create(
		args: Omit<EscortingFlightGroupProps, "taskWaypoints"> & {
			targetFlightGroupId: Types.Campaign.Id;
		},
	) {
		const taskWaypoint: WaypointTemplate = args.holdWaypoint.toEscortWaypoint();

		const waypoints: Array<WaypointTemplate> = [taskWaypoint];

		return new EscortingFlightGroup({
			...args,
			taskWaypoints: waypoints,
			targetFlightGroupId: args.targetFlightGroupId,
		});
	}
}
