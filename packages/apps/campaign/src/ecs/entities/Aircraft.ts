import * as DcsJs from "@foxdelta2/dcsjs";

import { Config } from "../../data";
import { world } from "../world";
import { Airdrome } from "./Airdrome";
import { FlightGroup } from "./FlightGroup";
import { HomeBase } from "./HomeBase";
import { Unit, UnitProps } from "./Unit";

export interface AircraftProps extends UnitProps {
	aircraftType: DcsJs.AircraftType;
	homeBase: HomeBase;
}

export class Aircraft extends Unit {
	public aircraftType: DcsJs.AircraftType;
	public flightGroup: FlightGroup | undefined = undefined;
	public homeBase: HomeBase;

	public constructor(args: AircraftProps) {
		super(args);
		this.aircraftType = args.aircraftType;
		this.homeBase = args.homeBase;

		this.homeBase.aircrafts.add(this);
		world.queries.aircrafts[args.coalition].add(this);
	}

	public deconstructor() {
		this.homeBase.aircrafts.delete(this);
		this.flightGroup?.aircrafts.delete(this);
		world.queries.aircrafts[this.coalition].delete(this);
	}

	static generateAircraftsForAirdrome(args: { coalition: DcsJs.Coalition; airdrome: Airdrome }) {
		for (const task in world.dataStore?.tasks ?? {}) {
			this.generateAircraftsForTask({
				...args,
				homeBase: args.airdrome,
				task: task as DcsJs.Task,
			});
		}
	}

	static generateAircraftsForTask(args: { coalition: DcsJs.Coalition; homeBase: HomeBase; task: DcsJs.Task }) {
		const taskAircraftTypes = world.factionDefinitions[args.coalition]?.aircraftTypes[args.task];

		if (taskAircraftTypes == null) {
			return;
		}

		for (const aircraftType of taskAircraftTypes) {
			const count = Math.max(2, Config.inventory.aircraft[args.task] / taskAircraftTypes.length);
			const aircraft = world.dataStore?.aircrafts?.[aircraftType];

			if (aircraft == null) {
				throw new Error(`aircraft: ${aircraftType} not found`);
			}

			Array.from({ length: count }).forEach(() => {
				new Aircraft({
					aircraftType,
					coalition: args.coalition,
					homeBase: args.homeBase,
				});
			});
		}
	}
}
