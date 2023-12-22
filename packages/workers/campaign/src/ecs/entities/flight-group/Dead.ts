import * as Types from "@kilcekru/dcc-shared-types";

import { FlightGroupProps } from ".";
import { EscortedFlightGroup } from "./EscortedFlightGroup";

interface DEADFlightGroupProps extends Omit<FlightGroupProps, "task"> {
	targetSAMId: Types.Campaign.Id;
}

export class DEADFlightGroup extends EscortedFlightGroup {
	private constructor(args: DEADFlightGroupProps) {
		super({ ...args, task: "DEAD" });
	}
}
