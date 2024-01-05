import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Serialization } from "../../../utils";
import { GenericWaypointTemplate, WaypointTemplate } from "../../objects";
import { getEntity, store } from "../../store";
import { EscortedFlightGroup, EscortedFlightGroupProps } from "../_base";
import { SAM } from "../SAM";
interface DeadFlightGroupProps extends Omit<EscortedFlightGroupProps, "entityType" | "task"> {
	targetSAMId: Types.Campaign.Id;
}

interface CreateDeadFlightGroupProps extends Omit<DeadFlightGroupProps, "task" | "taskWaypoints"> {
	holdWaypoint: WaypointTemplate | undefined;
}

export class DeadFlightGroup extends EscortedFlightGroup {
	readonly #targetSAMId: Types.Campaign.Id;

	private constructor(args: DeadFlightGroupProps | Types.Serialization.DeadFlightGroupSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: { ...args, task: "DEAD" as const, entityType: "DeadFlightGroup" as const };
		super(superArgs);
		this.#targetSAMId = args.targetSAMId;
	}

	static create(args: CreateDeadFlightGroupProps) {
		const targetSAM = getEntity<SAM>(args.targetSAMId);

		const duration = Utils.DateTime.Minutes(5);

		const waypoints: Array<WaypointTemplate> = [
			GenericWaypointTemplate.create({
				position: targetSAM.position,
				duration,
				type: "Task",
				name: "DEAD",
			}),
		];

		return new DeadFlightGroup({
			...args,
			targetSAMId: targetSAM.id,
			taskWaypoints: waypoints,
		});
	}

	/**
	 * Check if the SAM is already targeted by a DEAD package
	 * @param coalition - the coalition of the DEAD package
	 * @param structure - the structure to check
	 * @returns true if the ground group is already targeted by a DEAD package
	 */
	static #SAMAlreadyTargeted(args: { coalition: DcsJs.Coalition; sam: SAM }) {
		const coalitionDeadFgs = store.queries.flightGroups[args.coalition].get("DEAD");

		for (const fg of coalitionDeadFgs) {
			if (fg instanceof DeadFlightGroup && fg.#targetSAMId === args.sam.id) {
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
	static #getTargetSAM(args: Pick<DeadFlightGroupProps, "coalition" | "homeBase">) {
		const oppCoalition = Utils.Coalition.opposite(args.coalition);
		const oppSams = store.queries.SAMs[oppCoalition].get("active");

		let distanceToHomeBase = 99999999;
		let targetSam: SAM | undefined;

		// Search for enemy SAMs if they are a valid target and pick the closest one
		for (const oppSam of oppSams) {
			// Only target active SAMs or SAMs with 4 or more units
			if (oppSam.aliveUnits.length < 4 || !oppSam.active) {
				continue;
			}

			// Is the SAM already targeted by a DEAD package?
			if (this.#SAMAlreadyTargeted({ coalition: args.coalition, sam: oppSam })) {
				continue;
			}

			const distance = Utils.Location.distanceToPosition(args.homeBase.position, oppSam.position);

			if (distance < distanceToHomeBase && distance <= Utils.Config.packages["DEAD"].maxDistance) {
				targetSam = oppSam;
				distanceToHomeBase = distance;
			}
		}

		if (targetSam == null) {
			// eslint-disable-next-line no-console
			console.warn("no ground group target found for cas package", this);

			return;
		}

		return targetSam;
	}

	/**
	 *
	 * @param args
	 * @returns
	 */
	static getValidTarget(args: Pick<DeadFlightGroup, "coalition" | "homeBase">) {
		return this.#getTargetSAM(args);
	}

	static deserialize(args: Types.Serialization.DeadFlightGroupSerialized) {
		return new DeadFlightGroup(args);
	}

	public override serialize(): Types.Serialization.DeadFlightGroupSerialized {
		return {
			...super.serialize(),
			entityType: "DeadFlightGroup",
			targetSAMId: this.#targetSAMId,
		};
	}
}
