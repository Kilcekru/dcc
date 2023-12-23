import type * as Types from "@kilcekru/dcc-shared-types";

import { WaypointTemplate } from "../../objects/Waypoint";
import { EscortingFlightGroup, EscortingFlightGroupProps } from "./EscortingFlightGroup";

type EscortFlightGroupProps = Omit<EscortingFlightGroupProps, "entityType">;

export class EscortFlightGroup extends EscortingFlightGroup {
	private constructor(args: EscortFlightGroupProps) {
		super({ ...args, entityType: "EscortFlightGroup" });
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
}
