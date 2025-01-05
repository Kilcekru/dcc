import * as Data from "../data";
import {
	addDatalinks,
	addPropAircraft,
	addRadio,
	flightGroupTasks,
	getStartWaypointTasks,
	mapTaskActionsNumber,
	Minutes,
	msTimeToDcsTime,
	routePointTask,
} from "../utils";
import { Airdrome } from "./Airdrome";
import { GroupProps } from "./Group";
import type { Mission } from "./Mission";
import { UnitGroup } from "./UnitGroup";

export interface FlightGroupUnit {
	name: string;
	unitId: number;
	type: Data.AircraftType;
	callsign: Data.Callsign;
	onboardNumber: number;
	isClient: boolean;
	pylons: Data.Pylon[];
	heading?: number;
}

type TimeTableWaypoint = Data.InputTypes.Waypoint & {
	startTime: number;
};

type StartType = "cold" | "air" | "hot";

type StartPosition = Data.Position & {
	alt: number;
	alt_type: Data.AltitudeType;
	parking?: string;
	parking_id?: string;
};

/* interface FlightGroupProps extends GroupProps {
  units: FlightGroupUnit[];
  task: Data.Task;
  frequency: number;
  isHelicopter: boolean;
  cruiseSpeed: number;
  startTime: number;
  waypoints: Data.InputTypes.Waypoint[];

} */

export type FlightGroupProps = GroupProps &
	Data.InputTypes.FlightGroup & {
		units: FlightGroupUnit[];
		isHelicopter: boolean;
		coalition: Data.Coalition;
	};

function startPositionToWaypoint(startPosition: StartPosition) {
	return {
		x: startPosition.x,
		y: startPosition.y,
		alt: startPosition.alt,
		alt_type: startPosition.alt_type,
	};
}
export class FlightGroup extends UnitGroup {
	readonly units: FlightGroupUnit[];
	readonly task: Data.Task;
	readonly frequency: number;
	readonly isHelicopter: boolean;
	readonly hasClients: boolean;
	readonly startTime: number;
	readonly waypoints: Data.InputTypes.Waypoint[];
	readonly cruiseSpeed: number;
	readonly homeBaseName: string;
	readonly homeBaseType: Data.HomeBaseType;
	readonly coalition: Data.Coalition;

	get #takeOffWaypoint(): Data.InputTypes.Waypoint {
		const [takeOffWaypoint] = this.waypoints;

		if (takeOffWaypoint?.type !== "TakeOff") {
			throw new Error("First waypoint must be TakeOff");
		}

		return takeOffWaypoint;
	}

	constructor(args: FlightGroupProps) {
		super(args);
		this.units = args.units;
		this.task = args.task;
		this.frequency = args.frequency;
		this.isHelicopter = args.isHelicopter;
		this.startTime = args.startTime;
		this.waypoints = args.waypoints;
		this.cruiseSpeed = args.cruiseSpeed;
		this.coalition = args.coalition;
		this.homeBaseName = args.homeBaseName;
		this.homeBaseType = args.homeBaseType;
		this.hasClients = args.hasClients;
	}

	#calcStartType(mission: Mission): StartType {
		if (mission.time >= this.#takeOffWaypoint.arrivalTime + (this.#takeOffWaypoint.duration ?? 0)) {
			return "air";
		} else if (mission.time > this.startTime || mission.hotStart) {
			return "hot";
		} else {
			return "cold";
		}
	}

	#calcAltParams(onGround: boolean) {
		let alt = 6096;
		let alt_type: Data.AltitudeType = "BARO";

		if (onGround) {
			alt = 0;
			alt_type = "RADIO";
		} else {
			if (this.isHelicopter) {
				alt = 100;
				alt_type = "RADIO";
			}
		}

		return {
			alt,
			alt_type,
		};
	}

	#getAirdrome(mission: Mission): Airdrome | null {
		if (this.homeBaseType !== "Airdrome") {
			return null;
		}

		const airdrome = mission.airdromes[this.coalition]?.get(this.homeBaseName);

		if (airdrome == null) {
			// eslint-disable-next-line no-console
			console.log(mission.airdromes, {
				coalition: this.coalition,
				name: this.name,
			});
			throw new Error(`Airdrome ${this.homeBaseName} not found`);
		}

		return airdrome;
	}

	#homeBaseWaypointParams(mission: Mission):
		| {
				airdromeId: number;
		  }
		| {
				linkUnit: number;
				helipadId: number;
		  } {
		switch (this.homeBaseType) {
			case "Farp": {
				const country = mission.getCoalitionCountry(this.coalition);

				for (const staticGroup of country?.staticGroups ?? []) {
					if (staticGroup.name === this.homeBaseName) {
						return {
							linkUnit: staticGroup.unitId,
							helipadId: staticGroup.unitId,
						};
					}
				}

				throw new Error(`Farp ${this.homeBaseName} not found`);
			}
			default: {
				const airdrome = this.#getAirdrome(mission);
				if (airdrome == null) {
					throw new Error(`Airdrome ${this.homeBaseName} not found`);
				}
				return { airdromeId: airdrome.airdromeDefinition.id };
			}
		}
	}

	#calcPositionAndParking(mission: Mission, index: number): StartPosition {
		if (this.#calcStartType(mission) === "air") {
			return {
				x: this.position.x + index * 100,
				y: this.position.y + index * 100,
				...this.#calcAltParams(false),
			};
		}

		if (this.homeBaseType === "Farp") {
			return {
				x: this.position.x,
				y: this.position.y,
				...this.#calcAltParams(true),
			};
		}

		const airdrome = this.#getAirdrome(mission);
		if (airdrome == null) {
			throw new Error(`Airdrome ${this.homeBaseName} not found`);
		}
		const stand = airdrome.reserveStand(this.isHelicopter, this.startTime, this.#takeOffWaypoint.arrivalTime);

		return {
			parking_id: stand.id,
			parking: stand.crossroad_index.toString(),
			x: stand.x,
			y: stand.y,
			...this.#calcAltParams(true),
		};
	}

	#generateFirstWaypoint(
		waypoint: Data.InputTypes.Waypoint,
		mission: Mission,
		startPosition: StartPosition,
	): Data.GeneratedTypes.RoutePoint[] {
		const startType = this.#calcStartType(mission);
		const tasks = waypoint.type === "Task" ? flightGroupTasks({ flightGroup: this, mission }) : [];

		switch (startType) {
			case "air": {
				if (waypoint.type === "Task" && waypoint.name === "Race-Track Start" && waypoint.duration != null) {
					const altParams = this.#calcAltParams(false);
					const remainingDuration = waypoint.arrivalTime + waypoint.duration - mission.time;

					return [
						{
							...startPositionToWaypoint(startPosition),
							action: "Turning Point",
							ETA: 0,
							ETA_locked: true,
							name: "Start",
							speed: this.cruiseSpeed,
							speed_locked: true,
							type: "Turning Point",
							task: routePointTask(
								getStartWaypointTasks(
									this,
									false, // TODO
								),
							),
						},
						{
							...waypoint.position,
							...altParams,
							action: "Turning Point",
							ETA: 0,
							ETA_locked: false,
							name: waypoint.name,
							speed: this.cruiseSpeed,
							speed_locked: true,
							type: "Turning Point",
							task: routePointTask([
								Data.TaskAction.RaceTrack(altParams.alt, this.cruiseSpeed, msTimeToDcsTime(remainingDuration)),
							]),
						},
					];
				}

				if (waypoint.type === "Landing") {
					return [
						{
							...startPositionToWaypoint(startPosition),
							action: "Turning Point",
							ETA: 0,
							ETA_locked: true,
							name: "Start",
							speed: this.cruiseSpeed,
							speed_locked: true,
							type: "Turning Point",
							task: routePointTask(
								getStartWaypointTasks(
									this,
									false, // TODO
								),
							),
						},
						{
							...waypoint.position,
							...this.#calcAltParams(true),
							action: "Turning Point",
							ETA: 0,
							ETA_locked: false,
							name: waypoint.name,
							speed: this.cruiseSpeed,
							speed_locked: true,
							type: "Land",
						},
					];
				}

				return [
					{
						...startPositionToWaypoint(startPosition),
						action: "Turning Point",
						ETA: 0,
						ETA_locked: true,
						name: waypoint.name,
						speed: this.cruiseSpeed,
						speed_locked: true,
						type: "Turning Point",
						task: {
							id: "ComboTask",
							params: {
								tasks: mapTaskActionsNumber([
									...getStartWaypointTasks(
										this,
										false, // TODO
									),
									...tasks,
								]),
							},
						},
					},
				];
			}
			case "hot": {
				return [
					{
						...startPositionToWaypoint(startPosition),
						action: "From Parking Area Hot",
						ETA: this.#startTime(mission) === 0 ? 0 : msTimeToDcsTime(waypoint.arrivalTime),
						ETA_locked: true,
						name: waypoint.name,
						speed: this.cruiseSpeed,
						speed_locked: true,
						type: "TakeOffParkingHot",
						...this.#homeBaseWaypointParams(mission),
						task: {
							id: "ComboTask",
							params: {
								tasks: mapTaskActionsNumber([
									...getStartWaypointTasks(
										this,
										false, // TODO
									),
									...tasks,
								]),
							},
						},
					},
				];
			}
			default: {
				return [
					{
						...startPositionToWaypoint(startPosition),
						action: "From Parking Area",
						ETA: this.#startTime(mission) === 0 ? 0 : msTimeToDcsTime(waypoint.arrivalTime),
						ETA_locked: true,
						name: waypoint.name,
						speed: this.cruiseSpeed,
						speed_locked: true,
						type: "TakeOffParking",
						...this.#homeBaseWaypointParams(mission),
						task: {
							id: "ComboTask",
							params: {
								tasks: mapTaskActionsNumber(
									getStartWaypointTasks(
										this,
										false, // TODO
									),
								),
							},
						},
					},
				];
			}
		}
	}

	#generateWaypoint(waypoint: Data.InputTypes.Waypoint, mission: Mission): Data.GeneratedTypes.RoutePoint {
		const tasks = flightGroupTasks({ flightGroup: this, mission });
		const task = waypoint.type === "Task" ? routePointTask(tasks) : undefined;

		return {
			...waypoint.position,
			action: "Turning Point",
			ETA: msTimeToDcsTime(waypoint.arrivalTime),
			ETA_locked: false,
			name: waypoint.name,
			speed: this.cruiseSpeed,
			speed_locked: true,
			type: "Turning Point",
			...this.#calcAltParams(waypoint.onGround),
			task: task,
		};
	}

	#timeTableWaypoints() {
		const waypoints: TimeTableWaypoint[] = [];
		let waypointStartTime = this.startTime;

		for (const wp of this.waypoints) {
			waypoints.push({
				...wp,
				startTime: waypointStartTime,
			});

			waypointStartTime = wp.arrivalTime + 1;
		}

		return waypoints;
	}

	#relevantWaypoints(mission: Mission) {
		const waypoints: Data.InputTypes.Waypoint[] = [];
		let raceTrackEnd: number | undefined = undefined;

		for (const wp of this.#timeTableWaypoints()) {
			if (wp.name === "Race-Track Start" && wp.duration != null) {
				raceTrackEnd = wp.arrivalTime + wp.duration;
			}

			if (wp.arrivalTime > mission.time) {
				waypoints.push(wp);
				continue;
			}

			if (wp.type === "RaceTrack End") {
				if (raceTrackEnd != null && raceTrackEnd > mission.time) {
					waypoints.push(wp);
					continue;
				}

				raceTrackEnd = undefined;
				continue;
			}

			if (wp.duration == null) {
				continue;
			}

			if (wp.arrivalTime + wp.duration > mission.time) {
				waypoints.push(wp);
				continue;
			}
		}

		return waypoints;
	}

	#startTime(mission: Mission) {
		const adjustedStartTime = this.startTime - Minutes(2);

		if (adjustedStartTime < mission.time) {
			return 0; // msTimeToDcsTime(mission.time);
		}

		return msTimeToDcsTime(this.startTime);
	}

	#toGeneratedWaypoints(mission: Mission, startPosition: StartPosition): Data.GeneratedTypes.RoutePoint[] {
		const [firstWaypoint, ...restWaypoints] = this.#relevantWaypoints(mission);

		if (firstWaypoint == null) {
			// eslint-disable-next-line no-console
			console.error("No valid waypoint found", this.name, this.#relevantWaypoints(mission));
			throw new Error("No valid waypoint found");
		}

		const routePoint = this.#generateFirstWaypoint(firstWaypoint, mission, startPosition);

		for (const wp of restWaypoints) {
			routePoint.push(this.#generateWaypoint(wp, mission));
		}

		return routePoint;
	}

	#datalinksTeamMembers(unitType: Data.AircraftType, groupSize: number, mission: Mission) {
		const aircraftDefinition = Data.aircraftDefinitions[unitType];

		if (aircraftDefinition.datalinks == null) {
			return [];
		}

		const teamMembers: object[] = [];

		for (let i = 0; i < groupSize; i++) {
			if (unitType === "F-16C_50") {
				teamMembers.push({
					missionUnitId: mission.nextDatalinkUnitId,
					TDOA: true,
				});
			}
		}

		return teamMembers;
	}

	public getFrequencies(mission: Mission): Data.GroupFrequencies {
		const airdrome = this.#getAirdrome(mission);
		return {
			package: this.frequency,
			airdrome: airdrome?.airdromeDefinition.frequency ?? 0,
			awacs: 144, // Utils.Config.defaults.awacsFrequency,
		};
	}

	public override toGenerated(mission: Mission): Data.GeneratedTypes.FlightGroup {
		const units: Data.GeneratedTypes.FlightGroupUnit[] = [];
		const startType = this.#calcStartType(mission);

		const firstUnitPositionAndParking = this.#calcPositionAndParking(mission, 0);

		let groupIndex = 0;

		const firstUnit = this.units[0];

		if (firstUnit == null) {
			throw new Error("No unit found");
		}

		const teamMembers = this.#datalinksTeamMembers(firstUnit.type, this.units.length, mission);

		for (const unit of this.units) {
			const aircraftDefinition = Data.aircraftDefinitions[unit.type];

			const generatedUnit: Data.GeneratedTypes.FlightGroupUnit = {
				callsign: unit.callsign,
				livery_id: "default",
				name: unit.name,
				onboard_num: String(unit.onboardNumber),
				payload: {
					chaff: aircraftDefinition.chaff,
					flare: aircraftDefinition.flare,
					fuel: aircraftDefinition.max_fuel,
					gun: aircraftDefinition.gun ?? 100,
					ammo_type: aircraftDefinition.ammo_type,
					pylons: unit.pylons,
				},
				psi: 0,
				skill: unit.isClient ? "Client" : mission.aiSkill,
				speed: startType === "air" ? this.cruiseSpeed : 0,
				type: unit.type,
				AddPropAircraft: structuredClone(addPropAircraft(unit, groupIndex, mission)),
				Radio: addRadio(unit, this.getFrequencies(mission)),
				datalinks: addDatalinks(unit.type, groupIndex, teamMembers),
				unitId: unit.unitId,
				heading: unit.heading,
				...(groupIndex === 0 ? firstUnitPositionAndParking : this.#calcPositionAndParking(mission, groupIndex)),
			};

			units.push(generatedUnit);
			groupIndex++;
		}

		return {
			...super.toGenerated(mission),
			start_time: this.#startTime(mission),
			modulation: 0,
			tasks: {},
			radioSet: false,
			task: this.task,
			units,
			communication: true,
			frequency: this.frequency,
			hiddenOnMFD: this.hasClients ? undefined : false,
			hiddenOnPlanner: this.hasClients ? undefined : false,
			lateActivation: this.hasClients ? undefined : false,
			uncontrolled: false,
			route: {
				points: this.#toGeneratedWaypoints(mission, firstUnitPositionAndParking),
			},
		};
	}
}
