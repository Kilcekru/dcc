import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { HoldWaypoint, WaypointTemplate } from "../../objects/Waypoint";
import { getEntity } from "../../store";
import { FlightGroup, FlightGroupProps } from "../_base/FlightGroup";

export interface EscortingFlightGroupProps extends Omit<FlightGroupProps, "task"> {
	targetFlightGroupId: Types.Campaign.Id;
	holdWaypoint: HoldWaypoint;
}

export abstract class EscortingFlightGroup extends FlightGroup {
	readonly #targetFlightGroupId: Types.Campaign.Id;

	get target() {
		return getEntity<FlightGroup>(this.#targetFlightGroupId);
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
}
