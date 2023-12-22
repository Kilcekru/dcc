import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { Events } from "../../utils";
import { world } from "../world";
import type { FlightGroup } from "./flight-group/FlightGroup";
import type { HomeBase } from "./HomeBase";
import { Unit, UnitProps } from "./Unit";
export interface AircraftProps extends Omit<UnitProps, "queries"> {
	aircraftType: DcsJs.DCS.Aircraft;
	homeBase: HomeBase;
}

export type AircraftA2AWeapons = Map<string, { item: DcsJs.A2AWeapon; count: number; total: number }>;

export class Aircraft extends Unit<keyof Events.EventMap.Aircraft> {
	public readonly aircraftType: DcsJs.DCS.Aircraft;
	#flightGroupId: Types.Campaign.Id | undefined = undefined;
	public readonly homeBaseId: Types.Campaign.Id;
	#isClient = false;
	#loadout: DcsJs.Loadout | undefined = undefined;

	get flightGroup(): FlightGroup | undefined {
		if (this.#flightGroupId == null) {
			return undefined;
		}

		return world.getEntity<FlightGroup>(this.#flightGroupId);
	}

	get loadout() {
		return this.#loadout;
	}

	get isHelicopter() {
		return this.aircraftType.isHelicopter;
	}

	get homeBase() {
		return world.getEntity<HomeBase>(this.homeBaseId);
	}

	private constructor(args: AircraftProps) {
		super({
			coalition: args.coalition,
			queries: new Set(["aircrafts-idle"]),
		});
		this.aircraftType = args.aircraftType;
		this.homeBaseId = args.homeBase.id;
	}

	public static create(args: AircraftProps) {
		return new Aircraft(args);
	}

	override destructor() {
		super.destructor();
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

		this.#loadout = {
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

		if (this.#loadout == null) {
			return weapons;
		}

		for (const pylon of this.#loadout.pylons) {
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
		this.#flightGroupId = flightGroup.id;
		this.#addLoadout(flightGroup.task);
		this.moveSubQuery("aircrafts", "idle", "in use");
	}

	override toJSON(): Types.Campaign.AircraftItem {
		return {
			...super.toJSON(),
			aircraftType: this.aircraftType.name,
			homeBaseId: this.homeBaseId,
			flightGroupId: this.#flightGroupId,
			displayName: this.aircraftType.display_name,
			isClient: this.#isClient,
		};
	}
}
