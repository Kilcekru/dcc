import type * as Types from "@kilcekru/dcc-shared-types";

import { Serialization } from "../../../utils";
import { WaypointTemplate } from "../../objects";
import { EscortingFlightGroup, EscortingFlightGroupProps } from "../_base";

type EscortFlightGroupProps = Omit<EscortingFlightGroupProps, "entityType" | "task">;

type CreateEscortFlightGroupProps = Omit<EscortFlightGroupProps, "taskWaypoints">;

export class EscortFlightGroup extends EscortingFlightGroup {
	private constructor(args: EscortFlightGroupProps | Types.Serialization.EscortFlightGroupSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: { ...args, task: "Escort" as const, entityType: "EscortFlightGroup" as const };
		super(superArgs);
	}

	static create(args: CreateEscortFlightGroupProps) {
		const taskWaypoint: WaypointTemplate = args.holdWaypoint.toEscortWaypoint();

		return new EscortFlightGroup({
			...args,
			taskWaypoints: [taskWaypoint],
			targetFlightGroupId: args.targetFlightGroup.id,
		});
	}

	static deserialize(args: Types.Serialization.EscortFlightGroupSerialized) {
		return new EscortFlightGroup(args);
	}

	public override serialize(): Types.Serialization.EscortFlightGroupSerialized {
		return {
			...super.serialize(),
			entityType: "EscortFlightGroup",
		};
	}
}
