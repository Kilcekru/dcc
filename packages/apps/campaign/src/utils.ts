import type * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { LOtoLL } from "@kilcekru/dcs-coordinates";

import { Scenario } from "./data";
import { MapPosition, Position, Task } from "./types";

export const optionalClass = (className: string, optionalClass?: string) => {
	return className + (optionalClass == null ? "" : " " + optionalClass);
};

export const isEmpty = (object: object) => {
	return Object.keys(object).length === 0;
};

export const positionToMapPosition = (pos: { x: number; y: number }): MapPosition => {
	try {
		const latLng = LOtoLL({ map: "caucasus", x: pos.x, z: pos.y });

		return [latLng.lat, latLng.lng];
	} catch (e: unknown) {
		// eslint-disable-next-line no-console
		console.error(e, pos);
		throw new Error("invalid map position");
	}
};

export const headingToPosition = (position1: Position, position2: Position) => {
	return (Math.atan2(position2.y - position1.y, position2.x - position1.x) * 180) / Math.PI;
};

export const distanceToPosition = (position1: Position, position2: Position) => {
	return Math.sqrt(Math.pow(position2.x - position1.x, 2) + Math.pow(position2.y - position1.y, 2));
};

export const objectToPosition = <T extends Position>(value: T): Position => {
	return {
		x: value.x,
		y: value.y,
	};
};

export const addHeading = (heading: number, value: number) => {
	let sum = heading + value;

	while (sum < 0) {
		sum += 360;
	}

	return sum % 360;
};

export const Minutes = (value: number) => {
	return value * 60;
};

export const random = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

export const randomItem = <T>(arr: Array<T>, filterFn?: (value: T) => boolean): T | undefined => {
	const filtered = filterFn == null ? arr : [...arr].filter(filterFn);

	return filtered[random(0, filtered.length - 1)];
};

export const randomList = <T>(arr: Array<T>, length: number): Array<T> => {
	const selected: Array<T> = [];

	Array.from({ length: length }, () => {
		const s = randomItem(arr, (v) => !selected.some((a) => a == v));

		if (s == null) {
			return;
		}

		selected.push(s);
	});

	return selected;
};

export const randomCallSign = (dataStore: DataStore, type: "aircraft" | "helicopter" | "awacs") => {
	const callSigns = dataStore.callSigns?.[type];

	if (callSigns == null) {
		return {
			name: "Enfield",
			index: 1,
		};
	}
	const selected = randomItem(callSigns) ?? "Enfield";

	return {
		name: selected,
		index: callSigns.indexOf(selected) ?? 1,
	};
};

export const findInside = <T>(
	values: Array<T> | undefined,
	sourcePosition: Position,
	positionSelector: (value: T) => Position,
	radius: number
): Array<T> => {
	return (
		values?.filter((v) => {
			const position = positionSelector(v);
			/* return (
				(position.x - sourcePosition.x) * (position.x - sourcePosition.x) +
					(position.y - sourcePosition.y) * (position.y - sourcePosition.y) <=
				radius * radius
			); */

			return distanceToPosition(sourcePosition, position) <= radius;
		}) ?? []
	);
};

export const findNearest = <T>(
	values: Array<T> | undefined,
	sourcePosition: Position,
	positionSelector: (value: T) => Position
) => {
	return values?.reduce(
		([prevObj, prevDistance], v) => {
			const position = positionSelector(v);
			const distance = distanceToPosition(sourcePosition, position);

			if (distance < prevDistance) {
				return [v, distance] as [T, number];
			} else {
				return [prevObj, prevDistance] as [T, number];
			}
		},
		[undefined, 10000000] as [T, number]
	)[0];
};

export const degreesToRadians = (degrees: number) => {
	// return parseFloat(((degrees * Math.PI) / 180).toFixed(2));
	return (degrees / 360) * 2 * Math.PI;
};

export const positionFromHeading = (pos: Position, heading: number, distance: number): Position => {
	let positiveHeading = heading;
	while (positiveHeading < 0) {
		positiveHeading += 360;
	}

	positiveHeading %= 360;

	const radHeading = degreesToRadians(positiveHeading);

	return {
		x: pos.x + Math.cos(radHeading) * distance,
		y: pos.y + Math.sin(radHeading) * distance,
	};
};

export const positionAfterDurationToPosition = (
	sourcePosition: Position,
	targetPosition: Position,
	duration: number,
	speed: number
): Position => {
	if (duration <= 0) {
		return sourcePosition;
	}

	const distanceTraveled = speed * duration;
	const heading = headingToPosition(sourcePosition, targetPosition);

	return positionFromHeading(sourcePosition, heading, distanceTraveled);
};

export const getActiveWaypoint = (fg: DcsJs.CampaignFlightGroup, timer: number) => {
	return fg.waypoints.reduce((prev, wp) => {
		if (prev == null) {
			return wp;
		}

		if (wp.time <= timer) {
			return wp;
		}

		return prev;
	}, undefined as DcsJs.CampaignWaypoint | undefined);
};

export const getNextWaypoint = (fg: DcsJs.CampaignFlightGroup, waypoint: DcsJs.CampaignWaypoint) => {
	return fg.waypoints[fg.waypoints.indexOf(waypoint) + 1];
};

export const calcFlightGroupPosition = (
	fg: DcsJs.CampaignFlightGroup,
	timer: number,
	speed: number,
	dataStore: DataStore
) => {
	if (fg.startTime >= timer) {
		return;
	}

	const activeWaypoint = getActiveWaypoint(fg, timer);

	if (activeWaypoint == null) {
		return;
	}

	const nextWaypoint = getNextWaypoint(fg, activeWaypoint);

	const airdrome = dataStore.airdromes?.[fg.airdromeName];

	if (activeWaypoint?.racetrack == null) {
		return positionAfterDurationToPosition(
			activeWaypoint.position,
			nextWaypoint?.position ?? airdrome ?? activeWaypoint.position,
			timer - activeWaypoint.time,
			speed
		);
	} else {
		const timeOnStation = timer - activeWaypoint.time;
		const distancesAlreadyFlown = Math.floor(timeOnStation / activeWaypoint.racetrack.duration);
		const timeOnTrack = Math.floor(timeOnStation - distancesAlreadyFlown * activeWaypoint.racetrack.duration);

		if (distancesAlreadyFlown % 2 === 0) {
			return positionAfterDurationToPosition(
				activeWaypoint.position,
				activeWaypoint.racetrack.position,
				timeOnTrack,
				speed
			);
		} else {
			return positionAfterDurationToPosition(
				activeWaypoint.racetrack.position,
				activeWaypoint.position,
				timeOnTrack,
				speed
			);
		}
	}
};

export const firstItem = <T>(arr: Array<T> | undefined) => {
	return arr?.[0];
};

export const lastItem = <T>(arr: Array<T>) => {
	return arr[arr.length - 1];
};

export const calcPackageEndTime = (fgs: Array<DcsJs.CampaignFlightGroup>) => {
	return fgs.reduce((prev, fg) => {
		if (fg.landingTime > prev) {
			return fg.landingTime;
		} else {
			return prev;
		}
	}, 0);
};

export const getFlightGroups = (packages: Array<DcsJs.CampaignPackage> | undefined) => {
	return (
		packages?.reduce((prev, pkg) => {
			return [...prev, ...pkg.flightGroups];
		}, [] as Array<DcsJs.CampaignFlightGroup>) ?? []
	);
};

export const getUsableAircrafts = (activeAircrafts: Array<DcsJs.CampaignAircraft> | undefined, task: Task) => {
	return activeAircrafts?.filter(
		(aircraft) => aircraft.state === "idle" && aircraft.availableTasks.some((aircraftTask) => aircraftTask === task)
	);
};

export const getUsableAircraftsByType = (
	activeAircrafts: Record<string, DcsJs.CampaignAircraft> | undefined,
	aircraftTypes: Array<string> | undefined,
	count: number
) => {
	const aircrafts = Object.values(activeAircrafts ?? []).filter(
		(aircraft) =>
			aircraft.state === "idle" && aircraft.alive && aircraftTypes?.some((acType) => aircraft.aircraftType === acType)
	);

	return getUsableUnit(aircrafts, "aircraftType", count);
};

export const getUsableUnit = <T>(units: Array<T>, typeParam: keyof T, count: number) => {
	const usableUnitTypes = units.filter((ac) => {
		const acCount = units.filter((a) => a[typeParam] === ac[typeParam]).length;

		return acCount >= count;
	});

	const randomAircraft = randomItem(usableUnitTypes);

	return usableUnitTypes.filter((ac) => ac[typeParam] === randomAircraft?.[typeParam]);
};

export const getAircraftStateFromFlightGroup = (
	fg: DcsJs.CampaignFlightGroup,
	timer: number
): DcsJs.CampaignAircraftState | undefined => {
	if (fg.startTime < timer) {
		const activeWaypoint = getActiveWaypoint(fg, timer);

		switch (activeWaypoint?.name) {
			case "En Route":
				return "en route";
			case "Track-race start":
				return "on station";
			case "Landing":
				return "rtb";
			default:
				return "idle";
		}
	} else {
		return undefined;
	}
};

export const filterObjectiveCoalition = (
	objectives: Array<DcsJs.CampaignObjective>,
	coalition: DcsJs.CampaignCoalition
) => {
	return objectives.filter((obj) => obj.coalition === coalition);
};

export const getDurationEnRoute = (startPosition: Position, endPosition: Position, speed: number) => {
	const distanceToObjective = distanceToPosition(startPosition, endPosition);
	return distanceToObjective / speed;
};

export const oppositeCoalition = (coalition: DcsJs.CampaignCoalition | undefined): DcsJs.CampaignCoalition => {
	if (coalition === "blue") {
		return "red";
	} else if (coalition === "red") {
		return "blue";
	} else {
		return "neutral";
	}
};

export const coalitionToFactionString = (coalition: DcsJs.CampaignCoalition | undefined) => {
	if (coalition === "blue") {
		return "blueFaction";
	} else {
		return "redFaction";
	}
};

export const onboardNumber = () => {
	const num = random(1, 999);

	if (num > 99) {
		return `${num}`;
	} else if (num > 9) {
		return `0${num}`;
	} else {
		return `00${num}`;
	}
};

export const getUsableGroundUnits = (activeGroundUnits: Record<string, DcsJs.CampaignUnit>) => {
	return Object.values(activeGroundUnits).filter((unit) => unit.state === "idle" && unit.alive);
};

export const getScenarioFaction = (coalition: DcsJs.CampaignCoalition, scenario: Scenario) => {
	return coalition === "blue" ? scenario.blue : scenario.red;
};

export const sortAsc = <T>(a: T, b: T, fn: (o: T) => number) => {
	return fn(a) - fn(b);
};
