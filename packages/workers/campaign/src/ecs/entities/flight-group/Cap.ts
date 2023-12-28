import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events, Serialization } from "../../../utils";
import { RaceTrackWaypointTemplate, WaypointTemplate } from "../../objects";
import { getEntity, store } from "../../store";
import { FlightGroup, FlightGroupProps, HomeBase } from "../_base";

interface CapFlightGroupProps extends Omit<FlightGroupProps, "entityType" | "task" | "name"> {
	targetHomeBaseId: Types.Campaign.Id;
}

export class CapFlightGroup extends FlightGroup<keyof Events.EventMap.CapFlightGroup> {
	readonly #targetHomeBaseId: Types.Campaign.Id;

	get target() {
		return getEntity<HomeBase>(this.#targetHomeBaseId);
	}

	private constructor(args: CapFlightGroupProps | Types.Serialization.CapFlightGroupSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: ({ ...args, task: "CAP" as const, entityType: "CapFlightGroup" as const } as FlightGroupProps);

		super(superArgs);
		this.#targetHomeBaseId = args.targetHomeBaseId;
	}

	static #getOppAirdrome(args: Pick<CapFlightGroupProps, "coalition"> & { target: HomeBase }) {
		const oppAirdromes = store.queries.airdromes[Utils.Coalition.opposite(args.coalition)];

		const oppAirdrome = Utils.Location.findNearest(oppAirdromes, args.target.position, (ad) => ad.position);

		return oppAirdrome;
	}

	static getValidTarget(args: Pick<CapFlightGroupProps, "coalition"> & { target: HomeBase }) {
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
		const oppAirdrome = getEntity<HomeBase>(args.oppAirdromeId);

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
			RaceTrackWaypointTemplate.create({
				positions: { from: racetrackStart, to: racetrackEnd },
				duration,
			}),
		];

		return new CapFlightGroup({
			...args,
			taskWaypoints: waypoints,
			targetHomeBaseId: args.target.id,
		});
	}

	static deserialize(args: Types.Serialization.CapFlightGroupSerialized) {
		return new CapFlightGroup(args);
	}

	public override serialize(): Types.Serialization.CapFlightGroupSerialized {
		return {
			...super.serialize(),
			entityType: "CapFlightGroup",
			targetHomeBaseId: this.#targetHomeBaseId,
		};
	}
}
