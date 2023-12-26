import { Events, Serialization } from "../../../utils";
import { WaypointTemplate } from "../../objects";
import { EscortingFlightGroup, EscortingFlightGroupProps } from "../_base";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SeadFlightGroupProps extends Omit<EscortingFlightGroupProps, "entityType" | "task"> {}

export class SeadFlightGroup extends EscortingFlightGroup<keyof Events.EventMap.SeadFlightGroup> {
	private constructor(args: SeadFlightGroupProps | Serialization.SeadFlightGroupSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: { ...args, task: "SEAD" as const, entityType: "SeadFlightGroup" as const };
		super(superArgs);
	}

	static create(args: SeadFlightGroupProps) {
		const taskWaypoint: WaypointTemplate = args.holdWaypoint.toEscortWaypoint();

		const waypoints: Array<WaypointTemplate> = [taskWaypoint];

		return new SeadFlightGroup({
			...args,
			taskWaypoints: waypoints,
			targetFlightGroupId: args.targetFlightGroupId,
		});
	}

	static deserialize(args: Serialization.SeadFlightGroupSerialized) {
		return new SeadFlightGroup(args);
	}

	public override serialize(): Serialization.SeadFlightGroupSerialized {
		return {
			...super.serialize(),
			entityType: "SeadFlightGroup",
		};
	}
}
