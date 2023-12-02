import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
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

export type AircraftA2AWeapons = Map<string, { item: DcsJs.A2AWeapon; count: number; total: number }>;

export class Aircraft extends Unit {
	public aircraftType: DcsJs.DCS.Aircraft;
	public flightGroup: FlightGroup | undefined = undefined;
	public homeBase: HomeBase;
	public isClient = false;
	public loadout: DcsJs.Loadout | undefined = undefined;

	public constructor(args: AircraftProps) {
		super({
			coalition: args.coalition,
			queries: new Set(["aircrafts-idle"]),
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

	#addLoadout(task: DcsJs.Task) {
		let loadout = this.aircraftType.loadouts.find((l) => l.task === task);

		if (loadout == null) {
			loadout = this.aircraftType.loadouts.find((l) => l.task === "default");

			if (loadout == null) {
				// eslint-disable-next-line no-console
				throw new Error(`loadout not found for task: ${task} and aircraft: ${this.aircraftType.name}`);
			}
		}

		this.loadout = {
			...loadout,
			task: task,
			pylons: loadout.pylons.map((pylon): DcsJs.Pylon => {
				const launcher = Object.values(world.dataStore?.launchers ?? {}).find((l) => pylon.CLSID === l.CLSID);

				if (launcher == null) {
					// eslint-disable-next-line no-console
					throw new Error(`launcher not found for pylon: ${pylon.CLSID}`);
				}

				const weapon = launcher?.type === "Weapon" ? world.dataStore?.weapons?.[launcher.weapon] : undefined;

				return {
					CLSID: pylon.CLSID,
					num: pylon.num ?? 0,
					type: launcher.type,
					count: launcher.total,
					total: launcher.total,
					weapon,
				};
			}),
		};
	}

	/**
	 * Returns a map of all air to air weapons on the aircraft
	 *
	 * @returns A amp of all air to air weapons on the aircraft with the current count and total count
	 */
	get a2aWeapons() {
		const weapons: AircraftA2AWeapons = new Map();

		if (this.loadout == null) {
			return weapons;
		}

		for (const pylon of this.loadout.pylons) {
			if (pylon.weapon == null) {
				continue;
			}

			if (
				pylon.weapon.type !== "infrared" &&
				pylon.weapon.type !== "semi-active radar" &&
				pylon.weapon.type !== "active radar"
			) {
				continue;
			}

			const weapon = weapons.get(pylon.weapon.name);

			if (weapon == null) {
				weapons.set(pylon.weapon.name, { item: pylon.weapon, count: pylon.count, total: pylon.total });
			} else {
				weapon.count += pylon.count;
				weapon.total += pylon.total;
			}
		}

		return weapons;
	}

	/**
	 * Get the maximum range of all air to air range of the aircraft
	 *
	 * @returns The maximum range of all air to air weapons on the aircraft
	 */
	get a2aRange(): number {
		const weapons = this.a2aWeapons;

		let range = 0;

		for (const weapon of weapons.values()) {
			if (weapon.count === 0) {
				continue;
			}

			if (weapon.item.range > range) {
				range = weapon.item.range;
			}
		}

		return range;
	}

	addToFlightGroup(flightGroup: FlightGroup) {
		this.flightGroup = flightGroup;
		this.#addLoadout(flightGroup.task);
		this.moveSubQuery("aircrafts", "idle", "in use");
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

	override toJSON(): Types.Campaign.AircraftItem {
		return {
			...super.toJSON(),
			aircraftType: this.aircraftType.name,
			homeBase: this.homeBase.id,
			flightGroup: this.flightGroup?.id,
			displayName: this.aircraftType.display_name,
			isClient: this.isClient,
		};
	}
}
