import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { world } from "../world";
import { Airdrome } from "./Airdrome";
import { FlightGroup } from "./FlightGroup";
import { HomeBase } from "./HomeBase";
import { Unit, UnitProps } from "./Unit";

export interface AircraftProps extends UnitProps {
	aircraftType: DcsJs.DCS.Aircraft;
	homeBase: HomeBase;
}

export class Aircraft extends Unit {
	public aircraftType: DcsJs.DCS.Aircraft;
	public flightGroup: FlightGroup | undefined = undefined;
	public homeBase: HomeBase;

	public constructor(args: AircraftProps) {
		super({
			coalition: args.coalition,
			queries: ["aircrafts"],
		});
		this.aircraftType = args.aircraftType;
		this.homeBase = args.homeBase;

		this.homeBase.aircrafts.add(this);
	}

	override deconstructor() {
		super.deconstructor();
		this.homeBase.aircrafts.delete(this);
		this.flightGroup?.aircrafts.delete(this);
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
			const count = Math.max(2, Utils.Config.inventory.aircraft[args.task] / taskAircraftTypes.length);
			const aircraft = world.dataStore?.aircrafts?.[aircraftType];

			if (aircraft == null) {
				throw new Error(`aircraft: ${aircraftType} not found`);
			}

			Array.from({ length: count }).forEach(() => {
				new Aircraft({
					aircraftType: aircraft,
					coalition: args.coalition,
					homeBase: args.homeBase,
				});
			});
		}
	}
}
