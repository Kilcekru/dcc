import type * as Types from "@kilcekru/dcc-shared-types";

import { Events } from "../../../utils";
import { HoldWaypointTemplate } from "../../objects";
import { getEntity } from "../../store";
import { FlightGroup, FlightGroupProps } from "./FlightGroup";

export interface EscortingFlightGroupProps extends FlightGroupProps {
	targetFlightGroupId: Types.Campaign.Id;
	holdWaypoint: HoldWaypointTemplate;
}

export abstract class EscortingFlightGroup<EventNames extends keyof Events.EventMap.All = never> extends FlightGroup<
	EventNames | keyof Events.EventMap.EscortingFlightGroup
> {
	readonly #targetFlightGroupId: Types.Campaign.Id;

	get target() {
		return getEntity<FlightGroup>(this.#targetFlightGroupId);
	}

	protected constructor(args: EscortingFlightGroupProps | Types.Serialization.EscortingFlightGroupSerialized) {
		super(args);
		this.#targetFlightGroupId = args.targetFlightGroupId;
	}

	public override serialize(): Types.Serialization.EscortingFlightGroupSerialized {
		return {
			...super.serialize(),
			targetFlightGroupId: this.#targetFlightGroupId,
		};
	}
}
