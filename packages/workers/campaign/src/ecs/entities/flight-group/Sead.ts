import * as Types from "@kilcekru/dcc-shared-types";

import { Events, Serialization } from "../../../utils";
import { WaypointTemplate } from "../../objects";
import { EscortingFlightGroup, EscortingFlightGroupProps } from "../_base";

type SeadFlightGroupProps = Omit<EscortingFlightGroupProps, "entityType" | "task">;

type CreateSeadFlightGroupProps = Omit<SeadFlightGroupProps, "taskWaypoints">;

export class SeadFlightGroup extends EscortingFlightGroup<keyof Events.EventMap.SeadFlightGroup> {
	private constructor(args: SeadFlightGroupProps | Types.Serialization.SeadFlightGroupSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: { ...args, task: "SEAD" as const, entityType: "SeadFlightGroup" as const };
		super(superArgs);
	}

	static create(args: CreateSeadFlightGroupProps) {
		const taskWaypoint: WaypointTemplate = args.holdWaypoint.toEscortWaypoint();

		return new SeadFlightGroup({
			...args,
			taskWaypoints: [taskWaypoint],
		});
	}

	static deserialize(args: Types.Serialization.SeadFlightGroupSerialized) {
		return new SeadFlightGroup(args);
	}

	public override serialize(): Types.Serialization.SeadFlightGroupSerialized {
		return {
			...super.serialize(),
			entityType: "SeadFlightGroup",
		};
	}
}
