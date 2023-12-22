import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { calcHoldWaypoint, getValidAircraftBundles } from "../utils";
import { world } from "../world";
import { Entity, EntityId } from "./Entity";
import { AirAssaultFlightGroup, CapFlightGroup, CasFlightGroup, FlightGroup, StrikeFlightGroup } from "./flight-group";
import { EscortFlightGroup } from "./flight-group/Escort";
import { GroundGroup } from "./GroundGroup";
import { HomeBase } from "./HomeBase";
import { UnitCamp } from "./Structure";

type BasicProps = {
	coalition: DcsJs.Coalition;
};

type TaskProps =
	| {
			task: "CAP";
			target: HomeBase;
	  }
	| {
			task: "CAS" | "Pinpoint Strike";
	  }
	| {
			task: "Air Assault";
			unitCamp: UnitCamp;
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

	static create(args: PackageCreateProps) {
		const aircraftBundles = getValidAircraftBundles(args);

		if (aircraftBundles == null) {
			// eslint-disable-next-line no-console
			console.log("No valid aircraft bundles found", args);
			return false;
		}

		const pkg = new Package({
			coalition: args.coalition,
			task: args.task,
		});

		switch (args.task) {
			case "CAP": {
				const capBundle = aircraftBundles.get("CAP");

				if (capBundle == null || capBundle.task !== "CAP") {
					throw new Error("CAP bundle is null");
				}

				const fg = CapFlightGroup.create({
					coalition: args.coalition,
					position: capBundle.homeBase.position,
					package: pkg,
					aircrafts: capBundle.aircrafts,
					homeBase: capBundle.homeBase,
					oppAirdromeId: capBundle.oppAirdromeId,
					target: args.target,
				});

				if (fg == null) {
					throw new Error("Flight group could not be created");
				}

				pkg.#flightGroups.add(fg.id);

				break;
			}
			case "CAS": {
				const holdWaypoint = calcHoldWaypoint(aircraftBundles, "CAS");

				const casBundle = aircraftBundles.get("CAS");

				if (casBundle == null || casBundle.task !== "CAS") {
					throw new Error("CAS bundle is null");
				}

				const casFg = CasFlightGroup.create({
					coalition: args.coalition,
					position: casBundle.homeBase.position,
					package: pkg,
					aircrafts: casBundle.aircrafts,
					homeBase: casBundle.homeBase,
					targetGroundGroupId: casBundle.targetGroundGroupId,
					holdWaypoint,
				});

				if (casFg == null) {
					throw new Error("Flight group could not be created");
				}

				pkg.#flightGroups.add(casFg.id);

				const escortBundle = aircraftBundles.get("Escort");

				if (escortBundle != null && holdWaypoint != null) {
					const escortFg = EscortFlightGroup.create({
						coalition: args.coalition,
						position: escortBundle.homeBase.position,
						package: pkg,
						aircrafts: escortBundle.aircrafts,
						homeBase: escortBundle.homeBase,
						targetFlightGroupId: casFg.id,
						holdWaypoint: holdWaypoint,
					});

					if (escortFg == null) {
						throw new Error("Flight group could not be created");
					}

					pkg.#flightGroups.add(escortFg.id);

					casFg.addEscortFlightGroupId(escortFg.id);
				}

				break;
			}
			case "Pinpoint Strike": {
				const holdWaypoint = calcHoldWaypoint(aircraftBundles, "Pinpoint Strike");

				const strikeBundle = aircraftBundles.get("Pinpoint Strike");

				if (strikeBundle == null || strikeBundle.task !== "Pinpoint Strike") {
					throw new Error("Strike bundle is null");
				}

				const strikeFg = StrikeFlightGroup.create({
					coalition: args.coalition,
					position: strikeBundle.homeBase.position,
					package: pkg,
					aircrafts: strikeBundle.aircrafts,
					homeBase: strikeBundle.homeBase,
					targetStructureId: strikeBundle.targetStructureId,
					holdWaypoint,
				});

				if (strikeFg == null) {
					throw new Error("Flight group could not be created");
				}

				pkg.#flightGroups.add(strikeFg.id);

				const escortBundle = aircraftBundles.get("Escort");

				if (escortBundle != null && holdWaypoint != null) {
					const escortFg = EscortFlightGroup.create({
						coalition: args.coalition,
						position: escortBundle.homeBase.position,
						package: pkg,
						aircrafts: escortBundle.aircrafts,
						homeBase: escortBundle.homeBase,
						targetFlightGroupId: strikeFg.id,
						holdWaypoint: holdWaypoint,
					});

					if (escortFg == null) {
						throw new Error("Flight group could not be created");
					}

					pkg.#flightGroups.add(escortFg.id);

					strikeFg.addEscortFlightGroupId(escortFg.id);
				}

				break;
			}
			case "Air Assault": {
				const airAssaultBundle = aircraftBundles.get("Air Assault");

				if (airAssaultBundle == null || airAssaultBundle.task !== "Air Assault") {
					throw new Error("Air Assault bundle is null");
				}

				const targetGroundGroup = world.getEntity<GroundGroup>(airAssaultBundle.targetGroundGroupId);

				const gg = new GroundGroup({
					coalition: args.coalition,
					start: args.unitCamp.objective,
					target: targetGroundGroup.target,
					groupType: "infantry",
				});

				const airAssaultFg = AirAssaultFlightGroup.create({
					coalition: args.coalition,
					position: airAssaultBundle.homeBase.position,
					package: pkg,
					aircrafts: airAssaultBundle.aircrafts,
					homeBase: airAssaultBundle.homeBase,
					targetGroundGroupId: airAssaultBundle.targetGroundGroupId,
					groundGroupId: gg.id,
				});

				if (airAssaultFg == null) {
					throw new Error("Flight group could not be created");
				}

				gg.embark(airAssaultFg);

				pkg.#flightGroups.add(airAssaultFg.id);

				targetGroundGroup.target.incomingGroundGroup = gg;

				args.unitCamp.deploymentScore -= args.unitCamp.deploymentCostAirAssault;

				break;
			}
		}

		for (const aircraftBundle of aircraftBundles.values()) {
			const [aircraft] = aircraftBundle.aircrafts;

			if (aircraft?.aircraftType.cruiseSpeed != null && aircraft.aircraftType.cruiseSpeed < pkg.cruiseSpeed) {
				pkg.cruiseSpeed = aircraft.aircraftType.cruiseSpeed;
			}
		}

		return true;
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
