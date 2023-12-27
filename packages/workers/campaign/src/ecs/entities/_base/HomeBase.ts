import * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events, Serialization } from "../../../utils";
import { getEntity, store } from "../../store";
import { Aircraft } from "../Aircraft";
import { MapEntity, MapEntityProps } from "./MapEntity";

export type HomeBaseType = "airdrome" | "carrier" | "farp";

export interface HomeBaseProps extends MapEntityProps {
	name: string;
	type: HomeBaseType;
}

export abstract class HomeBase<EventNames extends keyof Events.EventMap.All = never> extends MapEntity<
	EventNames | keyof Events.EventMap.HomeBase
> {
	public readonly type: HomeBaseType;
	#aircraftIds: Types.Campaign.Id[] = [];

	get aircrafts(): readonly Aircraft[] {
		const retVal: Aircraft[] = [];

		for (const id of this.#aircraftIds) {
			const aircraft = getEntity<Aircraft>(id);

			retVal.push(aircraft);
		}

		return retVal;
	}

	public constructor(args: HomeBaseProps | Serialization.HomeBaseSerialized) {
		super(args);
		this.type = args.type;

		if (Serialization.isSerialized(args)) {
			this.#aircraftIds = args.aircraftIds;
		}
	}

	public generateAircraftsForHomeBase(args: { coalition: DcsJs.Coalition }) {
		for (const task in store.dataStore?.tasks ?? {}) {
			this.generateAircraftsForTask({
				...args,
				task: task as DcsJs.Task,
			});
		}
	}

	public generateAircraftsForTask(args: { coalition: DcsJs.Coalition; task: DcsJs.Task }) {
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

	override toJSON() {
		return {
			...super.toJSON(),
			type: this.type,
			aircrafts: Array.from(this.#aircraftIds),
		};
	}

	public override serialize(): Serialization.HomeBaseSerialized {
		return {
			...super.serialize(),
			type: this.type,
			aircraftIds: this.#aircraftIds,
		};
	}
}
