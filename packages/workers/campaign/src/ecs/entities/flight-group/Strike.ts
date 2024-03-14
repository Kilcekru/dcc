import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events, Serialization } from "../../../utils";
import { GenericWaypointTemplate, WaypointTemplate } from "../../objects";
import { getEntity, store } from "../../store";
import { EscortedFlightGroup, EscortedFlightGroupProps, Structure } from "../_base";

interface StrikeFlightGroupProps extends Omit<EscortedFlightGroupProps, "entityType" | "task"> {
	targetStructureId: Types.Campaign.Id;
}

interface CreateStrikeFlightGroupProps extends Omit<StrikeFlightGroupProps, "task" | "taskWaypoints"> {
	holdWaypoint: WaypointTemplate | undefined;
}

export class StrikeFlightGroup extends EscortedFlightGroup<keyof Events.EventMap.StrikeFlightGroup> {
	readonly #targetStructureId: Types.Campaign.Id;

	get target() {
		return getEntity<Structure>(this.#targetStructureId);
	}

	private constructor(args: StrikeFlightGroupProps | Types.Serialization.StrikeFlightGroupSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: { ...args, task: "Pinpoint Strike" as const, entityType: "StrikeFlightGroup" as const };
		super(superArgs);
		this.#targetStructureId = args.targetStructureId;
	}

	static create(args: CreateStrikeFlightGroupProps) {
		const targetStructure = getEntity<Structure>(args.targetStructureId);

		const duration = Utils.DateTime.Minutes(30);

		const waypoints: Array<WaypointTemplate> = [
			GenericWaypointTemplate.create({
				position: targetStructure.position,
				duration,
				type: "Task",
				name: "Strike",
			}),
		];

		return new StrikeFlightGroup({
			...args,
			targetStructureId: targetStructure.id,
			taskWaypoints: waypoints,
		});
	}

	/**
	 * Check if the structure is already targeted by a Strike flight group
	 * @param coalition - the coalition of the Strike flight group
	 * @param structure - the structure to check
	 * @returns true if the ground group is already targeted by a Strike flight group
	 */
	static #structureAlreadyTargeted(args: { coalition: DcsJs.Coalition; structure: Structure }) {
		const coalitionStrikeFgs = store.queries.flightGroups[args.coalition].get("Pinpoint Strike");

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
	static #getTargetStructure(args: Pick<StrikeFlightGroupProps, "coalition" | "homeBase">) {
		const oppCoalition = Utils.Coalition.opposite(args.coalition);
		const structures = store.queries.structures[args.coalition];
		const oppStructures = store.queries.structures[oppCoalition].get("strike targets");
		let distanceToHomeBase = 99999999;
		let targetStructure: Structure | undefined;

		for (const oppStructure of oppStructures) {
			// Is the structure already targeted by a Strike flight group?
			if (this.#structureAlreadyTargeted({ coalition: args.coalition, structure: oppStructure })) {
				continue;
			}

			const distance = Utils.Location.distanceToPosition(args.homeBase.position, oppStructure.position);

			if (distance > Utils.Config.packages["Pinpoint Strike"].maxDistance) {
				continue;
			}

			const nearestFrontline = Utils.Location.findNearest(structures, oppStructure.position, (str) => str.position);

			if (nearestFrontline == null) {
				if (distance < distanceToHomeBase) {
					targetStructure = oppStructure;
					distanceToHomeBase = distance;
				}

				continue;
			}

			const distanceToFrontline = Utils.Location.distanceToPosition(oppStructure.position, nearestFrontline.position);

			if (distanceToFrontline < distanceToHomeBase) {
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
	static getValidTarget(args: Pick<StrikeFlightGroupProps, "coalition" | "homeBase">) {
		const targetStructure = this.#getTargetStructure(args);

		if (targetStructure == null) {
			return undefined;
		}

		return targetStructure;
	}

	static deserialize(args: Types.Serialization.StrikeFlightGroupSerialized) {
		return new StrikeFlightGroup(args);
	}

	public override serialize(): Types.Serialization.StrikeFlightGroupSerialized {
		return {
			...super.serialize(),
			entityType: "StrikeFlightGroup",
			targetStructureId: this.#targetStructureId,
		};
	}
}
