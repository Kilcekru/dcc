import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events, Serialization } from "../../utils";
import { calcHoldWaypoint, getValidAircraftBundles } from "../utils";
import { world } from "../world";
import { Entity } from "./_base/Entity";
import { HomeBase } from "./_base/HomeBase";
import { AirAssaultFlightGroup, CapFlightGroup, CasFlightGroup, FlightGroup, StrikeFlightGroup } from "./flight-group";
import { EscortFlightGroup } from "./flight-group/Escort";
import { GroundGroup } from "./GroundGroup";
import { UnitCamp } from "./UnitCamp";

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

export class Package extends Entity<keyof Events.EventMap.Package> {
	#flightGroupIds = new Set<Types.Campaign.Id>();
	public task: DcsJs.Task;
	public cruiseSpeed: number = Utils.Config.defaults.cruiseSpeed;

	private constructor(args: PackageProps) {
		super({
			entityType: "Package",
			queries: [`packages-${args.task}` as const],
			coalition: args.coalition,
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
					aircraftIds: Array.from(capBundle.aircrafts).map((a) => a.id),
					homeBase: capBundle.homeBase,
					oppAirdromeId: capBundle.oppAirdromeId,
					target: args.target,
				});

				if (fg == null) {
					throw new Error("Flight group could not be created");
				}

				pkg.#flightGroupIds.add(fg.id);

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
					aircraftIds: Array.from(casBundle.aircrafts).map((a) => a.id),
					homeBase: casBundle.homeBase,
					targetGroundGroupId: casBundle.targetGroundGroupId,
					holdWaypoint,
				});

				if (casFg == null) {
					throw new Error("Flight group could not be created");
				}

				pkg.#flightGroupIds.add(casFg.id);

				const escortBundle = aircraftBundles.get("Escort");

				if (escortBundle != null && holdWaypoint != null) {
					const escortFg = EscortFlightGroup.create({
						coalition: args.coalition,
						position: escortBundle.homeBase.position,
						package: pkg,
						aircraftIds: Array.from(escortBundle.aircrafts).map((a) => a.id),
						homeBase: escortBundle.homeBase,
						targetFlightGroupId: casFg.id,
						holdWaypoint: holdWaypoint,
					});

					if (escortFg == null) {
						throw new Error("Flight group could not be created");
					}

					pkg.#flightGroupIds.add(escortFg.id);

					casFg.addEscortFlightGroupId("Escort", escortFg.id);
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
					aircraftIds: Array.from(strikeBundle.aircrafts).map((a) => a.id),
					homeBase: strikeBundle.homeBase,
					targetStructureId: strikeBundle.targetStructureId,
					holdWaypoint,
				});

				if (strikeFg == null) {
					throw new Error("Flight group could not be created");
				}

				pkg.#flightGroupIds.add(strikeFg.id);

				const escortBundle = aircraftBundles.get("Escort");

				if (escortBundle != null && holdWaypoint != null) {
					const escortFg = EscortFlightGroup.create({
						coalition: args.coalition,
						position: escortBundle.homeBase.position,
						package: pkg,
						aircraftIds: Array.from(escortBundle.aircrafts).map((a) => a.id),
						homeBase: escortBundle.homeBase,
						targetFlightGroupId: strikeFg.id,
						holdWaypoint: holdWaypoint,
					});

					if (escortFg == null) {
						throw new Error("Flight group could not be created");
					}

					pkg.#flightGroupIds.add(escortFg.id);

					strikeFg.addEscortFlightGroupId("Escort", escortFg.id);
				}

				break;
			}
			case "Air Assault": {
				const airAssaultBundle = aircraftBundles.get("Air Assault");

				if (airAssaultBundle == null || airAssaultBundle.task !== "Air Assault") {
					throw new Error("Air Assault bundle is null");
				}

				const targetGroundGroup = world.getEntity<GroundGroup>(airAssaultBundle.targetGroundGroupId);

				const gg = GroundGroup.create({
					coalition: args.coalition,
					start: args.unitCamp.objective,
					target: targetGroundGroup.target,
					groupType: "infantry",
				});

				const airAssaultFg = AirAssaultFlightGroup.create({
					coalition: args.coalition,
					position: airAssaultBundle.homeBase.position,
					package: pkg,
					aircraftIds: Array.from(airAssaultBundle.aircrafts).map((a) => a.id),
					homeBase: airAssaultBundle.homeBase,
					targetGroundGroupId: airAssaultBundle.targetGroundGroupId,
					groundGroupId: gg.id,
				});

				if (airAssaultFg == null) {
					throw new Error("Flight group could not be created");
				}

				gg.embark(airAssaultFg);

				pkg.#flightGroupIds.add(airAssaultFg.id);

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
		this.#flightGroupIds.delete(flightGroup.id);

		// If there are no more flight groups in this package, remove it from the world
		if (this.#flightGroupIds.size === 0) {
			this.destructor();
		}
	}

	override destructor(): void {
		for (const id of this.#flightGroupIds) {
			world.getEntity(id).destructor();
		}

		super.destructor();
	}

	override toJSON() {
		return {
			...super.toJSON(),
			task: this.task,
			flightGroups: Array.from(this.#flightGroupIds).map((id) => world.getEntity(id).toJSON()),
		};
	}

	public override serialize(): Serialization.PackageSerialized {
		return {
			...super.serialize(),
			entityType: "Package",
			task: this.task,
			cruiseSpeed: this.cruiseSpeed,
			flightGroupIds: [...this.#flightGroupIds],
		};
	}
}
