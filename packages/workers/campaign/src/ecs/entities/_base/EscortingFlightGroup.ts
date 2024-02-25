import type * as Types from "@kilcekru/dcc-shared-types";

import { Events, Serialization } from "../../../utils";
import { GenericWaypointTemplate, HoldWaypointTemplate } from "../../objects";
import { getEntity } from "../../store";
import { FlightGroup, FlightGroupProps } from "./FlightGroup";

export interface EscortingFlightGroupProps extends FlightGroupProps {
	targetFlightGroup: FlightGroup;
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
		const superArgs = Serialization.isSerialized(args)
			? args
			: {
					...args,
					taskWaypoints: [
						...args.taskWaypoints,
						...args.targetFlightGroup.flightplan.taskWaypointTemplates.map((template) =>
							GenericWaypointTemplate.create({
								position: template.position,
								duration: template.duration,
								type: "Nav",
								name: "Nav",
							}),
						),
					],
			  };
		super(superArgs);

		if (Serialization.isSerialized(args)) {
			this.#targetFlightGroupId = args.targetFlightGroupId;
		} else {
			this.#targetFlightGroupId = args.targetFlightGroup.id;
		}
	}

	public override serialize(): Types.Serialization.EscortingFlightGroupSerialized {
		return {
			...super.serialize(),
			targetFlightGroupId: this.#targetFlightGroupId,
		};
	}
}
