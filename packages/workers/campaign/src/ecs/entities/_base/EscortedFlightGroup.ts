import * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";

import { Events, Serialization } from "../../../utils";
import { FlightGroup, FlightGroupProps } from "./FlightGroup";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EscortedFlightGroupProps extends FlightGroupProps {}

export abstract class EscortedFlightGroup<EventNames extends keyof Events.EventMap.All = never> extends FlightGroup<
	EventNames | keyof Events.EventMap.EscortedFlightGroup
> {
	#escortFlightGroupId: Map<DcsJs.Task, Types.Campaign.Id> | undefined = undefined;

	constructor(args: EscortedFlightGroupProps | Serialization.EscortedFlightGroupSerialized) {
		super(args);

		if (Serialization.isSerialized(args)) {
			this.#escortFlightGroupId =
				args.escortFlightGroupId == null
					? undefined
					: (new Map(Object.entries(args.escortFlightGroupId)) as Map<DcsJs.Task, Types.Campaign.Id>);
		}
	}

	addEscortFlightGroupId(task: DcsJs.Task, escortFlightGroupId: Types.Campaign.Id) {
		if (this.#escortFlightGroupId == null) {
			this.#escortFlightGroupId = new Map();
		}

		this.#escortFlightGroupId.set(task, escortFlightGroupId);
	}

	public override serialize(): Serialization.EscortedFlightGroupSerialized {
		return {
			...super.serialize(),
			escortFlightGroupId:
				this.#escortFlightGroupId == null ? undefined : Object.fromEntries(this.#escortFlightGroupId.entries()),
		};
	}
}
