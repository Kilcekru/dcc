import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events } from "../../../utils";
import { world } from "../../world";
import type { HomeBase } from "../HomeBase";
import { WaypointTemplate, WaypointType } from "../Waypoint";
import { FlightGroup, FlightGroupProps } from "./FlightGroup";

interface CapFlightGroupProps extends Omit<FlightGroupProps, "task"> {
	targetHomeBaseId: Types.Campaign.Id;
}

export class CapFlightGroup extends FlightGroup<keyof Events.EventMap.CapFlightGroup> {
	readonly #targetHomeBaseId: Types.Campaign.Id;

	get target() {
		return world.getEntity<HomeBase>(this.#targetHomeBaseId);
	}

	private constructor(args: CapFlightGroupProps) {
		super({ ...args, task: "CAP" });
		this.#targetHomeBaseId = args.targetHomeBaseId;
		const prevWaypoint = Utils.Array.lastItem(args.taskWaypoints);

		if (prevWaypoint == null) {
			throw new Error("prevWaypoint is null");
		}
		this.flightplan.add(WaypointTemplate.takeOffWaypoint(args.homeBase));
		this.flightplan.add(...args.taskWaypoints);
		this.flightplan.add(
			...WaypointTemplate.landingWaypoints({
				prevWaypoint,
				homeBase: args.homeBase,
			}),
		);
	}

	static #getOppAirdrome(
		args: Omit<CapFlightGroupProps, "taskWaypoints" | "package" | "targetHomeBaseId"> & { target: HomeBase },
	) {
		const oppAirdromes = world.queries.airdromes[Utils.Coalition.opposite(args.coalition)];

		const oppAirdrome = Utils.Location.findNearest(oppAirdromes, args.target.position, (ad) => ad.position);

		return oppAirdrome;
	}

	static getValidTarget(
		args: Omit<CapFlightGroupProps, "taskWaypoints" | "package" | "targetHomeBaseId"> & { target: HomeBase },
	) {
		const oppAirdrome = this.#getOppAirdrome(args);

		if (oppAirdrome == null) {
			return undefined;
		}

		return oppAirdrome;
	}

	static create(
		args: Omit<CapFlightGroupProps, "taskWaypoints" | "targetHomeBaseId"> & {
			target: HomeBase;
			oppAirdromeId: Types.Campaign.Id;
		},
	) {
		const oppAirdrome = world.getEntity<HomeBase>(args.oppAirdromeId);

		const egressHeading = Utils.Location.headingToPosition(args.target.position, oppAirdrome.position);

		const centerPosition = Utils.Location.positionFromHeading(args.target.position, egressHeading, 30_000);

		const racetrackStart = Utils.Location.positionFromHeading(
			centerPosition,
			Utils.Location.addHeading(egressHeading, -90),
			20_000,
		);
		const racetrackEnd = Utils.Location.positionFromHeading(
			centerPosition,
			Utils.Location.addHeading(egressHeading, 90),
			20_000,
		);
		const duration = Utils.DateTime.Minutes(30);

		const waypoints: Array<WaypointTemplate> = [
			WaypointTemplate.raceTrackWaypoint({
				positions: { from: racetrackStart, to: racetrackEnd },
				duration,
				type: WaypointType.Task,
			}),
		];

		return new CapFlightGroup({
			...args,
			taskWaypoints: waypoints,
			targetHomeBaseId: args.target.id,
		});
	}
}
