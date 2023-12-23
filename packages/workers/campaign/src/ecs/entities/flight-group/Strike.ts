import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events } from "../../../utils";
import { WaypointTemplate, WaypointType } from "../../objects/Waypoint";
import { world } from "../../world";
import { FlightGroupProps } from "../_base/FlightGroup";
import type { Structure } from "../_base/Structure";
import { EscortedFlightGroup } from "./EscortedFlightGroup";

interface StrikeFlightGroupProps extends Omit<FlightGroupProps, "entityType" | "task"> {
	targetStructureId: Types.Campaign.Id;
}

export class StrikeFlightGroup extends EscortedFlightGroup<keyof Events.EventMap.StrikeFlightGroup> {
	readonly #targetStructureId: Types.Campaign.Id;

	get target() {
		return world.getEntity<Structure>(this.#targetStructureId);
	}

	private constructor(args: StrikeFlightGroupProps) {
		super({ ...args, entityType: "StrikeFlightGroup", task: "Pinpoint Strike" });
		this.#targetStructureId = args.targetStructureId;
	}

	/**
	 * Check if the structure is already targeted by a Strike flight group
	 * @param coalition - the coalition of the Strike flight group
	 * @param structure - the structure to check
	 * @returns true if the ground group is already targeted by a Strike flight group
	 */
	static #structureAlreadyTargeted(args: { coalition: DcsJs.Coalition; structure: Structure }) {
		const coalitionStrikeFgs = world.queries.flightGroups[args.coalition].get("Pinpoint Strike");

		for (const fg of coalitionStrikeFgs) {
			if (fg instanceof StrikeFlightGroup && fg.#targetStructureId === args.structure.id) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get a possible target structure for a Pinpoint Strike flight group
	 * @param coalition - the coalition of the Strike flight group
	 * @param homeBase - the home base of the Strike flight group
	 * @returns the possible target structure
	 **/
	static #getTargetStructure(args: Pick<FlightGroupProps, "coalition" | "homeBase">) {
		const oppCoalition = Utils.Coalition.opposite(args.coalition);
		const oppStructures = world.queries.structures[oppCoalition];
		let distanceToHomeBase = 99999999;
		let targetStructure: Structure | undefined;

		for (const oppStructure of oppStructures) {
			const distance = Utils.Location.distanceToPosition(args.homeBase.position, oppStructure.position);

			if (distance < distanceToHomeBase && distance <= Utils.Config.packages["Pinpoint Strike"].maxDistance) {
				// Is the structure already targeted by a Strike flight group?
				if (this.#structureAlreadyTargeted({ coalition: args.coalition, structure: oppStructure })) {
					continue;
				}

				targetStructure = oppStructure;
				distanceToHomeBase = distance;
			}
		}

		if (targetStructure == null) {
			// eslint-disable-next-line no-console
			console.warn("no ground group target found for cas package", this);

			return;
		}

		return targetStructure;
	}

	/**
	 *
	 * @param args
	 * @returns
	 */
	static getValidTarget(args: Pick<FlightGroupProps, "coalition" | "homeBase">) {
		const targetStructure = this.#getTargetStructure(args);

		if (targetStructure == null) {
			return undefined;
		}

		return targetStructure;
	}

	static create(
		args: Omit<StrikeFlightGroupProps, "task" | "taskWaypoints"> & {
			holdWaypoint: WaypointTemplate | undefined;
		},
	) {
		const targetStructure = this.#getTargetStructure(args);

		if (targetStructure == null) {
			// eslint-disable-next-line no-console
			throw new Error("no ground group target found for cas package");
		}

		const duration = Utils.DateTime.Minutes(30);

		const waypoints: Array<WaypointTemplate> = [
			WaypointTemplate.waypoint({
				position: targetStructure.position,
				duration,
				type: WaypointType.Task,
				name: "Strike",
			}),
		];

		return new StrikeFlightGroup({
			...args,
			targetStructureId: targetStructure.id,
			taskWaypoints: waypoints,
		});
	}
}
