import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events, Serialization } from "../../../utils";
import { WaypointTemplate } from "../../objects/waypoint";
import { getEntity, store } from "../../store";
import { generateCallSign } from "../../utils";
import type { Aircraft } from "../Aircraft";
import { Flightplan } from "../Flightplan";
import { type Package } from "../Package";
import { Group, GroupProps } from "./Group";
import type { HomeBase } from "./HomeBase";

export interface FlightGroupProps extends Omit<GroupProps, "queries" | "name"> {
	task: DcsJs.Task;
	package: Package;
	aircraftIds: Types.Campaign.Id[];
	homeBase: HomeBase;
	taskWaypoints: Array<WaypointTemplate>;
}

export type A2ACombat = {
	type: "a2a";
	targetId: Types.Campaign.Id;
	cooldownTime: number;
};

export abstract class FlightGroup<EventNames extends keyof Events.EventMap.All = never> extends Group<
	EventNames | keyof Events.EventMap.FlightGroup
> {
	readonly #aircraftIds: Types.Campaign.Id[];
	public readonly task: DcsJs.Task;
	readonly #flightplanId: Types.Campaign.Id;
	public readonly homeBaseId: Types.Campaign.Id;
	#combat: A2ACombat | undefined;
	#packageId: Types.Campaign.Id;

	get aircrafts(): readonly Aircraft[] {
		const aircrafts: Aircraft[] = [];

		for (const id of this.#aircraftIds) {
			const aircraft = getEntity<Aircraft>(id);

			aircrafts.push(aircraft);
		}

		return aircrafts;
	}

	get combat() {
		return this.#combat;
	}

	get aliveAircrafts(): readonly Aircraft[] {
		return this.aircrafts.filter((aircraft) => aircraft.alive);
	}

	get alive(): boolean {
		return this.aliveAircrafts.length > 0;
	}

	get active(): boolean {
		switch (this.state) {
			case "destroyed":
			case "landed":
				return false;
			default:
				return true;
		}
	}

	get package() {
		return getEntity<Package>(this.#packageId);
	}

	get flightplan() {
		return getEntity<Flightplan>(this.#flightplanId);
	}

	get isInCombat(): boolean {
		return this.#combat != null;
	}

	get startTime(): number {
		return this.package.startTime;
	}

	get state(): Types.Serialization.FlightGroupState {
		if (!this.alive) {
			return "destroyed";
		}
		if (this.queries.has("flightGroups-start up") && this.startTime <= store.time) {
			return "start up";
		}

		if (this.queries.has("flightGroups-in air")) {
			return "in air";
		}

		if (this.queries.has("flightGroups-landed")) {
			return "landed";
		}

		return "waiting";
	}

	get a2aRange(): number {
		let maxRange = 0;

		for (const aircraft of this.aircrafts) {
			const range = aircraft.a2aRange;

			if (range > maxRange) {
				maxRange = range;
			}
		}

		return maxRange;
	}

	get readyToFire(): boolean {
		if (this.combat == null) {
			return true;
		}

		return store.time >= this.combat.cooldownTime;
	}

	get a2aTarget(): FlightGroup | undefined {
		if (this.combat == null) {
			return undefined;
		}

		return getEntity<FlightGroup>(this.combat.targetId);
	}

	get homeBase(): HomeBase {
		return getEntity<HomeBase>(this.homeBaseId);
	}

	protected constructor(args: FlightGroupProps | Types.Serialization.FlightGroupSerialized) {
		const cs = Serialization.isSerialized(args) ? undefined : generateCallSign(args.coalition, "aircraft");
		const superArgs: GroupProps | Types.Serialization.GroupSerialized = Serialization.isSerialized(args)
			? args
			: { ...args, queries: [`flightGroups-${args.task}`, `flightGroups-start up`], name: cs?.flightGroupName ?? "" };
		super(superArgs);

		this.task = args.task;
		this.#aircraftIds = args.aircraftIds;

		if (Serialization.isSerialized(args)) {
			this.#packageId = args.packageId;
			this.homeBaseId = args.homeBaseId;
			this.#flightplanId = args.flightplanId;
		} else {
			this.hidden = true;
			this.#packageId = args.package.id;
			this.homeBaseId = args.homeBase.id;

			args.aircraftIds.forEach((aircraftId, i) => {
				const aircraft = getEntity<Aircraft>(aircraftId);
				aircraft.addToFlightGroup({
					id: this.id,
					task: args.task,
					callSign: cs?.unitCallSign(i) ?? {
						"1": 1,
						"2": 2,
						"3": 3,
						name: "",
					},
					name: cs?.unitName(i) ?? "",
				});
			});

			this.#flightplanId = Flightplan.create({
				...args,
				flightGroup: this,
				taskWaypoints: args.taskWaypoints,
			}).id;
		}

		for (const aircraft of this.aircrafts) {
			aircraft.on("destroyed", () => {
				if (!this.alive) {
					this.destroy();
				}
			});
		}
	}

	takeOff() {
		this.hidden = false;
		this.moveSubQuery("flightGroups", "start up", "in air");
	}

	land() {
		this.moveSubQuery("flightGroups", "in air", "landed");
		this.hidden = true;
		this.emit("landed");
	}

	move(worldDelta: number) {
		if (this.isInCombat && this.combat != null && this.a2aTarget != null) {
			const distance = Utils.Location.distanceToPosition(this.position, this.a2aTarget.position);

			let speed = 300;
			let heading = Utils.Location.headingToPosition(this.position, this.a2aTarget.position);

			if (distance < 2_000) {
				speed = 150;

				heading = Utils.Location.addHeading(heading, 90);
			}

			const distanceTraveled = Math.round(Utils.DateTime.toSeconds(worldDelta) * speed);
			this.position = Utils.Location.positionFromHeading(this.position, heading, distanceTraveled);
		} else {
			const target = this.flightplan.currentWaypoint;

			if (target == null) {
				// eslint-disable-next-line no-console
				console.warn("no target found for flight group", this);
				return;
			}

			if (target.isRacetrack && target.isActive) {
				if (target.racetrack == null || target.duration == null) {
					throw new Error("no racetrack found for waypoint");
				}

				// Calculate the distance between the racetrack points
				const racetrackDistance = Utils.Location.distanceToPosition(target.position, target.racetrack.position);
				const distancesAlreadyFlown =
					Utils.DateTime.toSeconds(store.time - target.arrivalTime) * this.package.cruiseSpeed;

				const racetrackRounds = Math.floor(distancesAlreadyFlown / racetrackDistance);

				// If the racetrack rounds are even, the flight group is heading to the racetrack start
				const raceTrackHeading =
					racetrackRounds % 2 === 0
						? Utils.Location.headingToPosition(target.position, target.racetrack.position)
						: Utils.Location.headingToPosition(target.racetrack.position, target.position);
				const distanceTraveled = Math.round(Utils.DateTime.toSeconds(worldDelta) * this.package.cruiseSpeed);
				this.position = Utils.Location.positionFromHeading(this.position, raceTrackHeading, distanceTraveled);
			} else {
				const heading = Utils.Location.headingToPosition(this.position, target.position);
				const distance = Utils.Location.distanceToPosition(this.position, target.position);

				// How long in seconds till the flight group arrives at the waypoint
				const timeTillArrival = this.flightplan.arrivalTime - store.time;
				// Calculate the speed in meters per second to reach the waypoint in time
				const speed = distance / Utils.DateTime.toSeconds(timeTillArrival);
				// Calculate the distance traveled in meters in the tick
				const distanceTraveled = Math.round(Utils.DateTime.toSeconds(worldDelta) * speed);
				// Calculate the new position
				this.position = Utils.Location.positionFromHeading(this.position, heading, distanceTraveled);
			}
		}
	}

	engageA2A(enemy: FlightGroup) {
		this.#combat = {
			type: "a2a",
			targetId: enemy.id,
			cooldownTime: store.time,
		};
	}

	fireA2A(distance: number) {
		if (this.combat == null || this.a2aTarget == null) {
			throw new Error("combat is null");
		}

		aircraftLoop: for (const aircraft of this.aircrafts) {
			const a2aWeapons = aircraft.a2aWeapons;

			for (const weapon of a2aWeapons.values()) {
				if (weapon.count > 0) {
					if (distance < weapon.item.range * Utils.Config.combat.a2a.rangeMultiplier) {
						weapon.count -= 1;

						// Does the missile hit?
						const distanceFactor = 1 - distance / weapon.item.range;

						if (Utils.Random.number(1, 100) <= 100 * distanceFactor) {
							// eslint-disable-next-line no-console
							console.log("fire", weapon.item.name, "at", this.a2aTarget.name, "from", this.name);

							this.combat.cooldownTime = store.time + Utils.Config.combat.a2a.cooldownDuration;

							const target = getEntity<FlightGroup>(this.combat.targetId);

							if (!target.alive) {
								// eslint-disable-next-line no-console
								console.warn("target is not alive", target);

								this.#combat = undefined;

								break aircraftLoop;
							}

							target.destroyAircraft();

							if (!target.active) {
								this.#combat = undefined;
							}

							break aircraftLoop;
						} else {
							// eslint-disable-next-line no-console
							console.log("miss", weapon.item.name, "at", this.a2aTarget.name, "from", this.name);
						}
					}
				}
			}
		}
	}

	setClient(count: number) {
		this.aircrafts.forEach((aircraft, i) => {
			aircraft.isClient = i < count;
		});
	}

	/**
	 * Destroy an aircraft in the flight group
	 *
	 * @returns true if the all aircraft within the flight group was destroyed
	 */
	destroyAircraft() {
		const [aircraft] = this.aliveAircrafts;

		if (aircraft == null) {
			throw new Error("aircraft is null");
		}

		aircraft.destroy();
	}

	stopCombat() {
		this.#combat = undefined;
	}

	destroy() {
		this.queries.delete("flightGroups-start up");
		this.queries.delete("flightGroups-in air");
		this.queries.delete("flightGroups-landed");
		this.queries.delete("flightGroups-waiting");
		this.addToQuery("flightGroups-destroyed");
		this.hidden = true;

		if (this.a2aTarget != null) {
			this.a2aTarget.stopCombat();
		}

		this.emit("destroyed");
	}

	override destructor(): void {
		// eslint-disable-next-line no-console
		console.log("destructor flight group", this.name, this.id);
		super.destructor();
		this.package.removeFlightGroup(this);
	}

	override toMapJSON(): Types.Campaign.FlightGroupMapItem {
		return {
			...super.toMapJSON(),
			position: this.position,
			type: "flightGroup",
			coalition: this.coalition,
			task: this.task,
			id: this.id,
		};
	}

	public override serialize(): Types.Serialization.FlightGroupSerialized {
		return {
			...super.serialize(),
			aircraftIds: this.#aircraftIds,
			homeBaseId: this.homeBaseId,
			task: this.task,
			startTime: this.startTime,
			packageId: this.#packageId,
			combat: this.combat,
			flightplanId: this.#flightplanId,
			state: this.state,
		};
	}
}
