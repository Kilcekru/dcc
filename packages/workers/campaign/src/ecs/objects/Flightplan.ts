import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { FlightGroup } from "../entities";
import { getEntity, store } from "../store";
import { Waypoint, WaypointTemplate } from "./Waypoint";

export class Flightplan {
	readonly #flightGroupId: Types.Campaign.Id;
	#list: Array<Waypoint> = [];

	constructor(flightGroup: FlightGroup) {
		this.#flightGroupId = flightGroup.id;
	}

	get flightGroup() {
		return getEntity<FlightGroup>(this.#flightGroupId);
	}

	get prevWaypoint() {
		return Utils.Array.lastItem(this.#list);
	}

	get currentWaypoint() {
		let waypoint: Waypoint | undefined;
		let flightPlanTime = this.startTime;

		if (store.time < this.startTime) {
			return;
		}

		for (const wp of this.#list) {
			flightPlanTime += wp.arrivalDuration + (wp.duration ?? 0);

			if (flightPlanTime > store.time) {
				waypoint = wp;
				break;
			}
		}

		return waypoint;
	}

	get timeTable() {
		const timeTable: Array<{
			start: string;
			end?: string;
			name: string;
		}> = [];
		let arrivalTime = this.startTime;

		for (const wp of this.#list) {
			arrivalTime += wp.arrivalDuration;

			timeTable.push({
				start: Utils.DateTime.timerToDate(arrivalTime).toISOString(),
				end: wp.duration == null ? undefined : Utils.DateTime.timerToDate(arrivalTime + wp.duration).toISOString(),
				name: wp.name,
			});

			arrivalTime += wp.duration ?? 0;
		}

		return timeTable;
	}

	get arrivalTime() {
		let arrivalTime = this.startTime;

		for (const wp of this.#list) {
			arrivalTime += wp.arrivalDuration;

			if (arrivalTime > store.time) {
				break;
			}

			arrivalTime += wp.duration ?? 0;
		}

		return arrivalTime;
	}

	get startTime() {
		return this.flightGroup.startTime;
	}

	get waypoints() {
		return this.#list;
	}

	#addSingle(waypoint: WaypointTemplate) {
		const prev = this.prevWaypoint;
		if (prev == null) {
			this.#list.push(new Waypoint({ ...waypoint, arrivalDuration: 0, flightplan: this }));
			return;
		}

		const distance = Utils.Location.distanceToPosition(prev.position, waypoint.position);

		const speed = this.flightGroup.package.cruiseSpeed;

		const arrivalDuration = Utils.DateTime.Seconds(Math.round(distance / speed));

		this.#list.push(new Waypoint({ ...waypoint, arrivalDuration, flightplan: this }));
	}

	add(...waypoints: Array<WaypointTemplate>) {
		for (const wp of waypoints) {
			this.#addSingle(wp);
		}
	}

	toJSON(): Types.Campaign.FlightplanItem {
		return this.#list.map((wp) => wp.toJSON());
	}
}
