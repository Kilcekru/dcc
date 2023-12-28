import * as Types from "@kilcekru/dcc-shared-types";

import type * as Entities from "../../entities";
import { getEntity, store } from "../../store";
import { WaypointTemplate, WaypointTemplateProps } from "./template";

export interface WaypointProps extends WaypointTemplateProps {
	arrivalDuration: number;
	flightplanId: Types.Campaign.Id;
}

export class Waypoint extends WaypointTemplate {
	public readonly arrivalDuration: number;
	readonly #flightplanId: Types.Campaign.Id;

	constructor(args: WaypointProps | Types.Serialization.WaypointSerialized) {
		super(args);
		this.#flightplanId = args.flightplanId;
		this.arrivalDuration = args.arrivalDuration;
	}

	get #flightplan() {
		return getEntity<Entities.Flightplan>(this.#flightplanId);
	}
	get isRacetrack() {
		return this.racetrack != null;
	}

	get arrivalTime() {
		let arrivalTime = this.#flightplan.startTime;

		for (const wp of this.#flightplan.waypoints) {
			arrivalTime += wp.arrivalDuration;

			if (wp === this) {
				break;
			}

			arrivalTime += wp.duration ?? 0;
		}

		return arrivalTime;
	}

	get departureTime() {
		return this.arrivalTime + (this.duration ?? 0);
	}

	get isActive() {
		return store.time >= this.arrivalTime && store.time <= this.departureTime;
	}

	public override serialize(): Types.Serialization.WaypointSerialized {
		return {
			...super.serialize(),
			arrivalDuration: this.arrivalDuration,
			flightplanId: this.#flightplanId,
		};
	}
}
