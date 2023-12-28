import * as Types from "@kilcekru/dcc-shared-types";

import { Serialization } from "../../../utils";
import { EscortedFlightGroup, FlightGroupProps } from "../_base";

interface DeadFlightGroupProps extends Omit<FlightGroupProps, "entityType" | "task"> {
	targetSAMId: Types.Campaign.Id;
}

export class DeadFlightGroup extends EscortedFlightGroup {
	readonly #targetSAMId: Types.Campaign.Id;

	private constructor(args: DeadFlightGroupProps | Types.Serialization.DeadFlightGroupSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: { ...args, task: "DEAD" as const, entityType: "DeadFlightGroup" as const };
		super(superArgs);
		this.#targetSAMId = args.targetSAMId;
	}

	static create(args: DeadFlightGroupProps) {
		return new DeadFlightGroup(args);
	}

	static deserialize(args: Types.Serialization.DeadFlightGroupSerialized) {
		return new DeadFlightGroup(args);
	}

	public override serialize(): Types.Serialization.DeadFlightGroupSerialized {
		return {
			...super.serialize(),
			entityType: "DeadFlightGroup",
			targetSAMId: this.#targetSAMId,
		};
	}
}
