import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events, Serialization } from "../../../utils";
import { getEntity, store } from "../../store";
import { Aircraft } from "../Aircraft";
import { MapEntity, MapEntityProps } from "./MapEntity";

export interface HomeBaseProps extends MapEntityProps {
	name: string;
	type: DcsJs.HomeBaseType;
}

export abstract class HomeBase<EventNames extends keyof Events.EventMap.All = never> extends MapEntity<
	EventNames | keyof Events.EventMap.HomeBase
> {
	public readonly type: DcsJs.HomeBaseType;
	#aircraftIds: Types.Campaign.Id[] = [];

	get aircrafts(): readonly Aircraft[] {
		const retVal: Aircraft[] = [];

		for (const id of this.#aircraftIds) {
			const aircraft = getEntity<Aircraft>(id);

			retVal.push(aircraft);
		}

		return retVal;
	}

	get latestStartTime() {
		const flightGroups = store.queries.flightGroups[this.coalition];

		let latestStartTime = store.time;

		for (const fg of flightGroups) {
			if (fg.homeBaseId === this.id) {
				if (fg.startTime > latestStartTime) {
					latestStartTime = fg.startTime;
				}
			}
		}

		return latestStartTime;
	}

	public constructor(args: HomeBaseProps | Types.Serialization.HomeBaseSerialized) {
		super(args);
		this.type = args.type;

		if (Serialization.isSerialized(args)) {
			this.#aircraftIds = args.aircraftIds;
		}
	}

	public generateAircraftsForHomeBase(args: { coalition: DcsJs.Coalition }) {
		for (const task in Types.Campaign.Schema.campaignTask.Values ?? {}) {
			this.generateAircraftsForTask({
				...args,
				task: task as Types.Campaign.CampaignTask,
			});
		}
	}

	public generateAircraftsForTask(args: { coalition: DcsJs.Coalition; task: Types.Campaign.CampaignTask }) {
		const taskAircraftTypes = store.factionDefinitions[args.coalition]?.aircraftTypes[args.task];

		if (taskAircraftTypes == null) {
			return;
		}

		for (const aircraftType of taskAircraftTypes) {
			const count = Math.max(2, Utils.Config.inventory.aircraft[args.task] / taskAircraftTypes.length);

			Array.from({ length: count }).forEach(() => {
				const ac = Aircraft.create({
					aircraftType,
					coalition: args.coalition,
					homeBaseId: this.id,
				});

				this.#aircraftIds.push(ac.id);
			});
		}
	}

	public removeAircraft(aircraft: Aircraft) {
		this.#aircraftIds = this.#aircraftIds.filter((id) => id !== aircraft.id);
	}

	override toJSON() {
		return {
			...super.toJSON(),
			type: this.type,
			aircrafts: Array.from(this.#aircraftIds),
		};
	}

	public override serialize(): Types.Serialization.HomeBaseSerialized {
		return {
			...super.serialize(),
			type: this.type,
			aircraftIds: this.#aircraftIds,
		};
	}
}
