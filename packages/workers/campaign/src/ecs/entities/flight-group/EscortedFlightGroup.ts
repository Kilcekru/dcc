import type * as Types from "@kilcekru/dcc-shared-types";

import { world } from "../../world";
import { FlightGroup, FlightGroupProps } from ".";

export interface EscortedFlightGroupProps extends FlightGroupProps {
	escortFlightGroupId?: Types.Campaign.Id;
}

export class EscortedFlightGroup extends FlightGroup {
	#escortFlightGroupId: Types.Campaign.Id | undefined = undefined;

	get escortFlightGroup() {
		if (this.#escortFlightGroupId == null) {
			return undefined;
		}

		return world.getEntity<FlightGroup>(this.#escortFlightGroupId);
	}

	constructor(args: EscortedFlightGroupProps) {
		super(args);
		this.#escortFlightGroupId = args.escortFlightGroupId;
	}

	addEscortFlightGroupId(escortFlightGroupId: Types.Campaign.Id) {
		this.#escortFlightGroupId = escortFlightGroupId;
	}
}
