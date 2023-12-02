import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Coalition, Task } from "../components";
import { getAircraftBundle } from "../utils";
import { QueryKey } from "../world";
import { Entity } from "./Entity";
import { CapFlightGroup, FlightGroup } from "./FlightGroup";
import { HomeBase } from "./HomeBase";

type BasicProps = {
	coalition: DcsJs.Coalition;
};

type TaskProps = {
	task: "CAP";
	target: HomeBase;
};

export type PackageCreateProps = BasicProps & TaskProps;

export interface PackageProps {
	coalition: DcsJs.Coalition;
	task: DcsJs.Task;
}

export class Package extends Entity implements Coalition, Task {
	public flightGroups: Set<FlightGroup> = new Set();
	public task: DcsJs.Task;
	public cruiseSpeed: number = Utils.Config.defaults.cruiseSpeed;

	private constructor(args: PackageProps) {
		super({
			coalition: args.coalition,
			queries: new Set([`packages-${args.task}` as QueryKey]),
		});
		this.coalition = args.coalition;
		this.task = args.task;
	}

	static create(args: PackageCreateProps) {
		const aircraftBundle = getAircraftBundle({
			coalition: args.coalition,
			task: args.task,
		});

		if (aircraftBundle == null) {
			// eslint-disable-next-line no-console
			console.warn("package creation failed. no aircraft bundle found", args);
			return;
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
			case "CAP":
				CapFlightGroup.create({
					coalition: args.coalition,
					position: aircraftBundle.homeBase.position,
					package: pkg,
					target: args.target,
					aircrafts: aircraftBundle.aircrafts,
					homeBase: aircraftBundle.homeBase,
				});
				break;
		}
	}

	removeFlightGroup(flightGroup: FlightGroup) {
		this.flightGroups.delete(flightGroup);

		// If there are no more flight groups in this package, remove it from the world
		if (this.flightGroups.size === 0) {
			this.deconstructor();
		}
	}

	override deconstructor(): void {
		for (const flightGroup of this.flightGroups) {
			flightGroup.deconstructor();
		}

		super.deconstructor();
	}

	override toJSON() {
		return {
			...super.toJSON(),
			task: this.task,
			flightGroups: Array.from(this.flightGroups).map((fg) => fg.toJSON()),
		};
	}
}
