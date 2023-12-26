import type * as Types from "@kilcekru/dcc-shared-types";

import { Serialization } from "../../../utils";
import { WaypointTemplate } from "../../objects";
import { EscortingFlightGroup, EscortingFlightGroupProps } from "../_base";

type EscortFlightGroupProps = Omit<EscortingFlightGroupProps, "entityType" | "task">;

export class EscortFlightGroup extends EscortingFlightGroup {
	private constructor(args: EscortFlightGroupProps | Serialization.EscortFlightGroupSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: { ...args, task: "Escort" as const, entityType: "EscortFlightGroup" as const };
		super(superArgs);
	}

	static create(
		args: Omit<EscortFlightGroupProps, "taskWaypoints"> & {
			targetFlightGroupId: Types.Campaign.Id;
		},
	) {
		const taskWaypoint: WaypointTemplate = args.holdWaypoint.toEscortWaypoint();

		const waypoints: Array<WaypointTemplate> = [taskWaypoint];

		return new EscortFlightGroup({
			...args,
			taskWaypoints: waypoints,
			targetFlightGroupId: args.targetFlightGroupId,
		});
	}

	static deserialize(args: Serialization.EscortFlightGroupSerialized) {
		return new EscortFlightGroup(args);
	}

	public override serialize(): Serialization.EscortFlightGroupSerialized {
		return {
			...super.serialize(),
			entityType: "EscortFlightGroup",
		};
	}
}
