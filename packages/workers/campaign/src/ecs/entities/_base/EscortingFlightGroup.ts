import type * as Types from "@kilcekru/dcc-shared-types";

import { Events, Serialization } from "../../../utils";
import { HoldWaypoint } from "../../objects/Waypoint";
import { getEntity } from "../../store";
import { FlightGroup, FlightGroupProps } from "./FlightGroup";

export interface EscortingFlightGroupProps extends FlightGroupProps {
	targetFlightGroupId: Types.Campaign.Id;
	holdWaypoint: HoldWaypoint;
}

export abstract class EscortingFlightGroup<EventNames extends keyof Events.EventMap.All = never> extends FlightGroup<
	EventNames | keyof Events.EventMap.EscortingFlightGroup
> {
	readonly #targetFlightGroupId: Types.Campaign.Id;

	get target() {
		return getEntity<FlightGroup>(this.#targetFlightGroupId);
	}

	protected constructor(args: EscortingFlightGroupProps | Serialization.EscortingFlightGroupSerialized) {
		super(args);
		this.#targetFlightGroupId = args.targetFlightGroupId;
		/* const prevWaypoint = Utils.Array.lastItem(args.taskWaypoints);

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
		); */
	}

	public override serialize(): Serialization.EscortingFlightGroupSerialized {
		return {
			...super.serialize(),
			targetFlightGroupId: this.#targetFlightGroupId,
		};
	}
}
