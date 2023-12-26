import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events, Serialization } from "../../../utils";
import { WaypointTemplate, WaypointType } from "../../objects";
import { getEntity, store } from "../../store";
import { groundGroupAlreadyTargeted } from "../../utils";
import { EscortedFlightGroup, EscortedFlightGroupProps } from "../_base";
import type { GroundGroup } from "../GroundGroup";

interface CasFlightGroupProps extends Omit<EscortedFlightGroupProps, "entityType" | "task"> {
	targetGroundGroupId: Types.Campaign.Id;
}

export class CasFlightGroup extends EscortedFlightGroup<keyof Events.EventMap.CasFlightGroup> {
	readonly #targetGroundGroupId: Types.Campaign.Id;

	get target() {
		return getEntity<GroundGroup>(this.#targetGroundGroupId);
	}

	private constructor(args: CasFlightGroupProps | Serialization.CasFlightGroupSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: { ...args, task: "CAS" as const, entityType: "CasFlightGroup" as const };
		super(superArgs);
		this.#targetGroundGroupId = args.targetGroundGroupId;
	}

	/**
	 * Get a possible target ground group for a CAS flight group
	 * @param coalition - the coalition of the CAS flight group
	 * @param homeBase - the home base of the CAS flight group
	 * @returns the target ground group
	 */
	static #getTargetGroundGroup(args: Pick<EscortedFlightGroupProps, "coalition" | "homeBase">) {
		const oppCoalition = Utils.Coalition.opposite(args.coalition);
		const oppGroundGroups = store.queries.groundGroups[oppCoalition].get("on target");
		let distanceToHomeBase = 99999999;
		let targetGroundGroup: GroundGroup | undefined;

		for (const oppGroundGroup of oppGroundGroups) {
			const distance = Utils.Location.distanceToPosition(args.homeBase.position, oppGroundGroup.position);

			if (distance < distanceToHomeBase && distance <= Utils.Config.packages.CAS.maxDistance) {
				if (groundGroupAlreadyTargeted({ coalition: args.coalition, groundGroup: oppGroundGroup })) {
					continue;
				}

				targetGroundGroup = oppGroundGroup;
				distanceToHomeBase = distance;
			}
		}

		if (targetGroundGroup == null) {
			// eslint-disable-next-line no-console
			console.warn("no ground group target found for cas package", this);

			return;
		}

		return targetGroundGroup;
	}

	/**
	 *
	 * @param args
	 * @returns
	 */
	static getValidTarget(args: Pick<EscortedFlightGroupProps, "coalition" | "homeBase">) {
		const targetGroundGroup = this.#getTargetGroundGroup(args);

		if (targetGroundGroup == null) {
			return undefined;
		}

		return targetGroundGroup;
	}

	static create(
		args: Omit<CasFlightGroupProps, "taskWaypoints"> & {
			targetGroundGroupId: Types.Campaign.Id;
			holdWaypoint: WaypointTemplate | undefined;
		},
	) {
		const targetGroundGroup = getEntity<GroundGroup>(args.targetGroundGroupId);

		if (targetGroundGroup == null) {
			// eslint-disable-next-line no-console
			throw new Error("no ground group target found for cas package");
		}

		const duration = Utils.DateTime.Minutes(30);

		const waypoints: Array<WaypointTemplate> = [];

		if (args.holdWaypoint != null) {
			waypoints.push(args.holdWaypoint);
		}

		waypoints.push(
			WaypointTemplate.waypoint({
				position: targetGroundGroup.position,
				duration,
				type: WaypointType.Task,
				name: "CAS",
				onGround: true,
			}),
		);

		return new CasFlightGroup({
			...args,
			targetGroundGroupId: targetGroundGroup.id,
			taskWaypoints: waypoints,
		});
	}

	static deserialize(args: Serialization.CasFlightGroupSerialized) {
		return new CasFlightGroup(args);
	}

	public override serialize(): Serialization.CasFlightGroupSerialized {
		return {
			...super.serialize(),
			entityType: "CasFlightGroup",
			targetGroundGroupId: this.#targetGroundGroupId,
		};
	}
}
