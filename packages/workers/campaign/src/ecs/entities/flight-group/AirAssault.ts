import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { WaypointTemplate, WaypointType } from "../../objects/Waypoint";
import { groundGroupAlreadyTargeted } from "../../utils";
import { world } from "../../world";
import { FlightGroup, FlightGroupProps } from "../_base/FlightGroup";
import { GroundGroup } from "../GroundGroup";

interface AirAssaultFlightGroupProps extends Omit<FlightGroupProps, "entityType" | "task"> {
	targetGroundGroupId: Types.Campaign.Id;
	groundGroupId: Types.Campaign.Id;
}

export class AirAssaultFlightGroup extends FlightGroup {
	readonly #targetGroundGroupId: Types.Campaign.Id;
	#embarkedGroundGroupId: Types.Campaign.Id | undefined;

	private constructor(args: AirAssaultFlightGroupProps) {
		super({ ...args, entityType: "AirAssaultFlightGroup", task: "Air Assault" });
		this.#targetGroundGroupId = args.targetGroundGroupId;
		this.#embarkedGroundGroupId = args.groundGroupId;
	}

	/**
	 * Returns the embarked ground group
	 */
	get embarkedGroundGroup() {
		if (this.#embarkedGroundGroupId == null) {
			return undefined;
		}

		return world.getEntity<GroundGroup>(this.#embarkedGroundGroupId);
	}

	/**
	 * Check if a ground group is embarked on the flight group
	 */
	get hasEmbarkedGroundGroup() {
		return this.#embarkedGroundGroupId != null;
	}

	get target() {
		return world.getEntity<GroundGroup>(this.#targetGroundGroupId);
	}

	/**
	 * Unload the embarked ground group
	 *
	 */
	unloadGroundGroup() {
		if (this.#embarkedGroundGroupId == null) {
			// eslint-disable-next-line no-console
			console.warn("no embarked ground group found for air assault flight group", this);
			return;
		}

		const embarkedGroundGroup = world.getEntity<GroundGroup>(this.#embarkedGroundGroupId);

		embarkedGroundGroup.disembark();

		this.#embarkedGroundGroupId = undefined;
	}

	/**
	 * Get a possible target ground group for a CAS flight group
	 * @param coalition - the coalition of the CAS flight group
	 * @param homeBase - the home base of the CAS flight group
	 * @returns the target ground group
	 */
	static #getTargetGroundGroup(args: Pick<FlightGroupProps, "coalition" | "homeBase">) {
		const oppCoalition = Utils.Coalition.opposite(args.coalition);
		const oppGroundGroups = world.queries.groundGroups[oppCoalition].get("on target");
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
	static getValidTarget(args: Pick<FlightGroupProps, "coalition" | "homeBase">) {
		const targetGroundGroup = this.#getTargetGroundGroup(args);

		if (targetGroundGroup == null) {
			return undefined;
		}

		return targetGroundGroup;
	}

	static create(
		args: Omit<AirAssaultFlightGroupProps, "taskWaypoints"> & {
			targetGroundGroupId: Types.Campaign.Id;
			groundGroupId: Types.Campaign.Id;
		},
	) {
		const targetGroundGroup = world.getEntity<GroundGroup>(args.targetGroundGroupId);

		if (targetGroundGroup == null) {
			// eslint-disable-next-line no-console
			throw new Error("no ground group target found for cas package");
		}

		const duration = Utils.DateTime.Minutes(30);

		const waypoints: Array<WaypointTemplate> = [];

		waypoints.push(
			WaypointTemplate.waypoint({
				position: targetGroundGroup.position,
				duration,
				type: WaypointType.Task,
				name: "Drop Off",
				onGround: true,
			}),
		);

		return new AirAssaultFlightGroup({
			...args,
			targetGroundGroupId: targetGroundGroup.id,
			groundGroupId: args.groundGroupId,
			taskWaypoints: waypoints,
		});
	}
}
