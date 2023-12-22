import * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";

import { FlightGroup, FlightGroupProps } from ".";
export class EscortedFlightGroup extends FlightGroup {
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
