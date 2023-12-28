import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events, Serialization } from "../../utils";
import { LandingWaypointTemplate, TakeoffWaypointTemplate, Waypoint, WaypointTemplate } from "../objects/waypoint";
import {} from "../objects/waypoint/template/TakeOff";
import { getEntity, store } from "../store";
import { Entity, EntityProps, FlightGroup } from ".";

export interface FlightplanProps extends EntityProps {
	flightGroupId: Types.Campaign.Id;
}

export interface CreateFlightplanProps extends EntityProps {
	flightGroup: FlightGroup;
	taskWaypoints: Array<WaypointTemplate>;
}

export class Flightplan extends Entity<keyof Events.EventMap.Flightplan> {
	#flightGroupId: Types.Campaign.Id;
	#list: Array<Waypoint> = [];

	private constructor(args: FlightplanProps | Types.Serialization.FlightplanSerialized) {
		const superArgs = Serialization.isSerialized(args) ? args : { ...args, entityType: "Flightplan" as const };
		super(superArgs);
		this.#flightGroupId = args.flightGroupId;

		if (Serialization.isSerialized(args)) {
			this.#list = args.waypoints.map((wp) => new Waypoint(wp));
		}
	}

	public static create(args: CreateFlightplanProps) {
		const plan = new Flightplan({ ...args, flightGroupId: args.flightGroup.id });

		plan.add(TakeoffWaypointTemplate.create({ homeBase: args.flightGroup.homeBase }));
		plan.add(...args.taskWaypoints);
		plan.add(LandingWaypointTemplate.create({ homeBase: args.flightGroup.homeBase }));

		return plan;
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
			this.#list.push(new Waypoint({ ...waypoint, arrivalDuration: 0, flightplanId: this.id }));
			return;
		}

		const distance = Utils.Location.distanceToPosition(prev.position, waypoint.position);

		const speed = this.flightGroup.package.cruiseSpeed;

		const arrivalDuration = Utils.DateTime.Seconds(Math.round(distance / speed));

		this.#list.push(new Waypoint({ ...waypoint, arrivalDuration, flightplanId: this.id }));
	}

	add(...waypoints: Array<WaypointTemplate>) {
		for (const wp of waypoints) {
			this.#addSingle(wp);
		}
	}

	static deserialize(args: Types.Serialization.FlightplanSerialized) {
		return new Flightplan(args);
	}

	public override serialize(): Types.Serialization.FlightplanSerialized {
		return {
			...super.serialize(),
			entityType: "Flightplan",
			flightGroupId: this.#flightGroupId,
			waypoints: this.#list.map((wp) => wp.serialize()),
		};
	}
}
