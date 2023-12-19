import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { world } from "../../world";
import type { GroundGroup } from "../GroundGroup";
import { WaypointTemplate, WaypointType } from "../Waypoint";
import { EscortedFlightGroup, EscortedFlightGroupProps } from "./EscortedFlightGroup";

interface CasFlightGroupProps extends Omit<EscortedFlightGroupProps, "task"> {
	targetGroundGroupId: Types.Campaign.Id;
	escortFlightGroupId?: Types.Campaign.Id;
}

export class CasFlightGroup extends EscortedFlightGroup {
	readonly #targetGroundGroupId: Types.Campaign.Id;

	get target() {
		return world.getEntity<GroundGroup>(this.#targetGroundGroupId);
	}

	private constructor(args: CasFlightGroupProps) {
		super({ ...args, task: "CAS" });
		this.#targetGroundGroupId = args.targetGroundGroupId;
	}

	/**
	 * Check if the ground group is already targeted by a CAS flight group
	 * @param coalition - the coalition of the CAS flight group
	 * @param groundGroup - the ground group to check
	 * @returns true if the ground group is already targeted by a CAS flight group
	 */
	static #groundGroupAlreadyTargeted(args: { coalition: DcsJs.Coalition; groundGroup: GroundGroup }) {
		const coalitionCASFgs = world.queries.flightGroups[args.coalition].get("CAS");

		for (const fg of coalitionCASFgs) {
			if (fg instanceof CasFlightGroup && fg.#targetGroundGroupId === args.groundGroup.id) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get a possible target ground group for a CAS flight group
	 * @param coalition - the coalition of the CAS flight group
	 * @param homeBase - the home base of the CAS flight group
	 * @returns the target ground group
	 */
	static #getTargetGroundGroup(args: Pick<EscortedFlightGroupProps, "coalition" | "homeBase">) {
		const oppCoalition = Utils.Coalition.opposite(args.coalition);
		const oppGroundGroups = world.queries.groundGroups[oppCoalition].get("on target");
		let distanceToHomeBase = 99999999;
		let targetGroundGroup: GroundGroup | undefined;

		for (const oppGroundGroup of oppGroundGroups) {
			const distance = Utils.Location.distanceToPosition(args.homeBase.position, oppGroundGroup.position);

			if (distance < distanceToHomeBase && distance <= Utils.Config.packages.CAS.maxDistance) {
				if (this.#groundGroupAlreadyTargeted({ coalition: args.coalition, groundGroup: oppGroundGroup })) {
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
		args: Omit<EscortedFlightGroupProps, "task" | "taskWaypoints"> & {
			targetGroundGroupId: Types.Campaign.Id;
			holdWaypoint: WaypointTemplate | undefined;
		},
	) {
		const targetGroundGroup = world.getEntity<GroundGroup>(args.targetGroundGroupId);

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
}
