import * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events } from "../../../utils";
import { world } from "../../world";
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
	public readonly name: string;
	public readonly type: HomeBaseType;
	#aircraftIds: Set<Types.Campaign.Id> = new Set();

	get aircrafts(): readonly Aircraft[] {
		const retVal: Aircraft[] = [];

		for (const id of this.#aircraftIds) {
			const aircraft = world.getEntity<Aircraft>(id);

			retVal.push(aircraft);
		}

		return retVal;
	}

	public constructor(args: HomeBaseProps) {
		super(args);
		this.name = args.name;
		this.type = args.type;
	}

	public generateAircraftsForHomeBase(args: { coalition: DcsJs.Coalition }) {
		for (const task in world.dataStore?.tasks ?? {}) {
			this.generateAircraftsForTask({
				...args,
				task: task as DcsJs.Task,
			});
		}
	}

	public generateAircraftsForTask(args: { coalition: DcsJs.Coalition; task: DcsJs.Task }) {
		const taskAircraftTypes = world.factionDefinitions[args.coalition]?.aircraftTypes[args.task];

		if (taskAircraftTypes == null) {
			return;
		}

		for (const aircraftType of taskAircraftTypes) {
			const count = Math.max(2, Utils.Config.inventory.aircraft[args.task] / taskAircraftTypes.length);
			const aircraft = world.dataStore?.aircrafts?.[aircraftType];

			if (aircraft == null) {
				throw new Error(`aircraft: ${aircraftType} not found`);
			}

			Array.from({ length: count }).forEach(() => {
				const ac = Aircraft.create({
					aircraftType: aircraft,
					coalition: args.coalition,
					homeBase: this,
				});

				this.#aircraftIds.add(ac.id);
			});
		}
	}

	override toJSON() {
		return {
			...super.toJSON(),
			name: this.name,
			type: this.type,
			aircrafts: Array.from(this.#aircraftIds),
		};
	}
}
