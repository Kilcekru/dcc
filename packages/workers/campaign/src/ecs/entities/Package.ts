import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { AircraftBundle, getAircraftBundle } from "../utils";
import { world } from "../world";
import { Entity, EntityId } from "./Entity";
import { CapFlightGroup, CasFlightGroup, FlightGroup } from "./FlightGroup";
import type { HomeBase } from "./HomeBase";

type BasicProps = {
	coalition: DcsJs.Coalition;
};

type TaskProps =
	| {
			task: "CAP";
			target: HomeBase;
	  }
	| {
			task: "CAS";
	  };

export type PackageCreateProps = BasicProps & TaskProps;

export interface PackageProps {
	coalition: DcsJs.Coalition;
	task: DcsJs.Task;
}

export class Package extends Entity {
	#flightGroups = new Set<EntityId>();
	public task: DcsJs.Task;
	public cruiseSpeed: number = Utils.Config.defaults.cruiseSpeed;

	private constructor(args: PackageProps) {
		super({
			coalition: args.coalition,
			queries: new Set([`packages-${args.task}` as const]),
		});
		this.task = args.task;
	}

	static #createAircraftBundle(args: PackageCreateProps) {
		let aircraftBundle: AircraftBundle | undefined = undefined;

		switch (args.task) {
			case "CAP":
				aircraftBundle = getAircraftBundle({
					coalition: args.coalition,
					task: args.task,
					target: args.target,
				});
				break;
			case "CAS":
				aircraftBundle = getAircraftBundle({
					coalition: args.coalition,
					task: args.task,
				});
				break;
		}

		return aircraftBundle;
	}

	static isAvailable(args: PackageCreateProps) {
		const aircraftBundle = Package.#createAircraftBundle(args);

		if (aircraftBundle == null) {
			return false;
		}

		switch (args.task) {
			case "CAP": {
				const isAvailable = CapFlightGroup.isAvailable({
					coalition: args.coalition,
					position: aircraftBundle.homeBase.position,
					target: args.target,
					aircrafts: aircraftBundle.aircrafts,
					homeBase: aircraftBundle.homeBase,
				});

				return isAvailable;
			}
			case "CAS": {
				const isAvailable = CasFlightGroup.isAvailable({
					coalition: args.coalition,
					homeBase: aircraftBundle.homeBase,
				});

				return isAvailable;
			}
		}

		return true;
	}

	static create(args: PackageCreateProps) {
		if (!Package.isAvailable(args)) {
			throw new Error("Package is not available");
		}

		const aircraftBundle = Package.#createAircraftBundle(args);

		if (aircraftBundle == null) {
			throw new Error("Package is not available");
		}

		const pkg = new Package({
			coalition: args.coalition,
			task: args.task,
		});

		const [aircraft] = aircraftBundle.aircrafts;

		if (aircraft?.aircraftType.cruiseSpeed != null && aircraft.aircraftType.cruiseSpeed < pkg.cruiseSpeed) {
			pkg.cruiseSpeed = aircraft.aircraftType.cruiseSpeed;
		}

		switch (args.task) {
			case "CAP": {
				const fg = CapFlightGroup.create({
					coalition: args.coalition,
					position: aircraftBundle.homeBase.position,
					package: pkg,
					target: args.target,
					aircrafts: aircraftBundle.aircrafts,
					homeBase: aircraftBundle.homeBase,
				});

				if (fg == null) {
					return;
				}

				pkg.#flightGroups.add(fg.id);

				break;
			}
			case "CAS": {
				const fg = CasFlightGroup.create({
					coalition: args.coalition,
					position: aircraftBundle.homeBase.position,
					package: pkg,
					aircrafts: aircraftBundle.aircrafts,
					homeBase: aircraftBundle.homeBase,
				});

				if (fg == null) {
					return;
				}

				pkg.#flightGroups.add(fg.id);

				break;
			}
		}
	}

	removeFlightGroup(flightGroup: FlightGroup) {
		this.#flightGroups.delete(flightGroup.id);

		// If there are no more flight groups in this package, remove it from the world
		if (this.#flightGroups.size === 0) {
			this.deconstructor();
		}
	}

	override deconstructor(): void {
		for (const id of this.#flightGroups) {
			world.getEntity(id).deconstructor();
		}

		super.deconstructor();
	}

	override toJSON() {
		return {
			...super.toJSON(),
			task: this.task,
			flightGroups: Array.from(this.#flightGroups).map((id) => world.getEntity(id).toJSON()),
		};
	}
}
