import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { Events, Serialization } from "../../utils";
import { getEntity, QueryKey, store } from "../store";
import type { FlightGroup } from "./_base/FlightGroup";
import type { HomeBase } from "./_base/HomeBase";
import { Unit, UnitProps } from "./_base/Unit";
export interface AircraftProps extends Omit<UnitProps, "entityType" | "queries"> {
	aircraftType: DcsJs.AircraftType;
	homeBaseId: Types.Campaign.Id;
}

export type AircraftA2AWeapons = Map<string, { item: DcsJs.A2AWeapon; count: number; total: number }>;

export class Aircraft extends Unit<keyof Events.EventMap.Aircraft> {
	readonly #aircraftType: DcsJs.AircraftType;
	#flightGroupId: Types.Campaign.Id | undefined = undefined;
	#callSign: Serialization.CallSign | undefined = undefined;
	#name: string | undefined = undefined;
	readonly #homeBaseId: Types.Campaign.Id;
	#isClient = false;
	#loadout: DcsJs.Loadout | undefined = undefined;

	get flightGroup(): FlightGroup | undefined {
		if (this.#flightGroupId == null) {
			return undefined;
		}

		return getEntity<FlightGroup>(this.#flightGroupId);
	}

	get loadout() {
		return this.#loadout;
	}

	get aircraftData() {
		const data = store.dataStore?.aircrafts?.[this.#aircraftType];

		if (data == null) {
			throw new Error(`aircraft: ${this.#aircraftType} not found`);
		}

		return data;
	}

	get isHelicopter() {
		return this.aircraftData.isHelicopter;
	}

	get homeBase() {
		return getEntity<HomeBase>(this.#homeBaseId);
	}

	set isClient(value: boolean) {
		this.#isClient = value;
	}

	private constructor(args: AircraftProps | Serialization.AircraftSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: { ...args, entityType: "Aircraft" as const, queries: ["aircrafts-idle"] as QueryKey[] };
		super(superArgs);
		this.#aircraftType = args.aircraftType;
		this.#homeBaseId = args.homeBaseId;

		if (Serialization.isSerialized(args)) {
			this.#callSign = args.callSign;
			this.#name = args.name;
			this.#isClient = args.isClient;
			this.#loadout = args.loadout;
		}
	}

	public static create(args: AircraftProps) {
		return new Aircraft(args);
	}

	override destructor() {
		super.destructor();
	}

	#addLoadout(task: DcsJs.Task) {
		let loadout = this.aircraftData.loadouts.find((l) => l.task === task);

		if (loadout == null) {
			loadout = this.aircraftData.loadouts.find((l) => l.task === "default");

			if (loadout == null) {
				// eslint-disable-next-line no-console
				throw new Error(`loadout not found for task: ${task} and aircraft: ${this.aircraftData.name}`);
			}
		}

		this.#loadout = {
			...loadout,
			task: task,
			pylons: loadout.pylons.map((pylon): DcsJs.Pylon => {
				const launcher = Object.values(store.dataStore?.launchers ?? {}).find((l) => pylon.CLSID === l.CLSID);

				if (launcher == null) {
					// eslint-disable-next-line no-console
					throw new Error(`launcher not found for pylon: ${pylon.CLSID}`);
				}

				const weapon = launcher?.type === "Weapon" ? store.dataStore?.weapons?.[launcher.weapon] : undefined;

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

	addToFlightGroup(args: { id: Types.Campaign.Id; task: DcsJs.Task; callSign: Serialization.CallSign; name: string }) {
		this.#flightGroupId = args.id;
		this.#callSign = args.callSign;
		this.#name = args.name;
		this.#addLoadout(args.task);
		this.moveSubQuery("aircrafts", "idle", "in use");
	}

	override toJSON(): Types.Campaign.AircraftItem {
		return {
			...super.toJSON(),
			aircraftType: this.aircraftData.name,
			homeBaseId: this.#homeBaseId,
			flightGroupId: this.#flightGroupId,
			displayName: this.aircraftData.display_name,
			isClient: this.#isClient,
		};
	}

	static deserialize(args: Serialization.AircraftSerialized) {
		return new Aircraft(args);
	}

	public override serialize(): Serialization.AircraftSerialized {
		return {
			...super.serialize(),
			entityType: "Aircraft",
			aircraftType: this.#aircraftType,
			homeBaseId: this.#homeBaseId,
			callSign: this.#callSign,
			name: this.#name,
			isClient: this.#isClient,
			loadout: this.#loadout,
		};
	}
}
