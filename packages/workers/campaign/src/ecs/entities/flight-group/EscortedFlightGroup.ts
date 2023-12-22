import * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";

import { Events } from "../../../utils";
import { FlightGroup, FlightGroupProps } from ".";
export abstract class EscortedFlightGroup<EventNames extends keyof Events.EventMap.All = never> extends FlightGroup<
	EventNames | keyof Events.EventMap.EscortedFlightGroup
> {
	#escortFlightGroupId: Map<DcsJs.Task, Types.Campaign.Id> | undefined = undefined;

	constructor(args: FlightGroupProps) {
		super(args);
	}

	addEscortFlightGroupId(task: DcsJs.Task, escortFlightGroupId: Types.Campaign.Id) {
		if (this.#escortFlightGroupId == null) {
			this.#escortFlightGroupId = new Map();
		}

		this.#escortFlightGroupId.set(task, escortFlightGroupId);
	}
}
