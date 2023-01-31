import type * as DcsJs from "@foxdelta2/dcsjs";

import { CallSigns } from "./data";
import { Scenario } from "./data/scenarios";
import { MapPosition, Position, Task } from "./types";

export const optionalClass = (className: string, optionalClass?: string) => {
	return className + (optionalClass == null ? "" : " " + optionalClass);
};

export const isEmpty = (object: object) => {
	return Object.keys(object).length === 0;
};

const basePos = { x: -317962.296875, y: 635632.96875 };
const baseLatLon: MapPosition = [41.9292, 41.8642];
export const positionToMapPosition = (pos: { x: number; y: number }): MapPosition => {
	const distance = distanceToPosition(basePos, pos);
	const heading = headingToPosition(basePos, pos);

	const newPosition = computeDestinationMapPosition(baseLatLon, distance, (heading - 90) * -1);

	return newPosition;
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

export const earthRadius = 6378137;
export const MINLAT = -90;
export const MAXLAT = 90;
export const MINLON = -180;
export const MAXLON = 180;

const computeDestinationMapPosition = (start: MapPosition, distance: number, bearing: number): MapPosition => {
	const lat = getLatitude(start);
	const lng = getLongitude(start);

	const delta = distance / earthRadius;
	const theta = toRad(bearing);

	const phi1 = toRad(lat);
	const lambda1 = toRad(lng);

	const phi2 = Math.asin(Math.sin(phi1) * Math.cos(delta) + Math.cos(phi1) * Math.sin(delta) * Math.cos(theta));

	let lambda2 =
		lambda1 +
		Math.atan2(Math.sin(theta) * Math.sin(delta) * Math.cos(phi1), Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2));

	let longitude = toDeg(lambda2);
	if (longitude < MINLON || longitude > MAXLON) {
		// normalise to >=-180 and <=180° if value is >MAXLON or <MINLON
		lambda2 = ((lambda2 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
		longitude = toDeg(lambda2);
	}

	return [longitude, toDeg(phi2)];
};

const getLatitude = (mapPosition: MapPosition) => {
	return mapPosition[1];
};

const getLongitude = (mapPosition: MapPosition) => {
	return mapPosition[0];
};

const toRad = (value: number) => (value * Math.PI) / 180;

const toDeg = (value: number) => (value * 180) / Math.PI;

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

export const randomCallSign = () => {
	return randomItem(CallSigns) ?? "Enfield";
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
	const distanceTraveled = speed * duration;
	const heading = headingToPosition(sourcePosition, targetPosition);

	return positionFromHeading(sourcePosition, heading, distanceTraveled);
};

export const getActiveWaypoint = (fg: DcsJs.CampaignFlightGroup, timer: number) => {
	return fg.waypoints.find((wp) => wp.time <= timer && wp.endTime >= timer);
};

export const calcFlightGroupPosition = (fg: DcsJs.CampaignFlightGroup, timer: number, speed: number) => {
	const activeWaypoint = getActiveWaypoint(fg, timer);

	if (activeWaypoint == null) {
		return;
	}

	if (activeWaypoint?.racetrack == null) {
		return positionAfterDurationToPosition(
			activeWaypoint.position,
			activeWaypoint.endPosition,
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
	activeAircrafts: Array<DcsJs.CampaignAircraft> | undefined,
	aircraftTypes: Array<string> | undefined
) => {
	return activeAircrafts?.filter(
		(aircraft) =>
			aircraft.state === "idle" && aircraft.alive && aircraftTypes?.some((acType) => aircraft.aircraftType === acType)
	);
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

export const getAircraftFromId = (activeAircrafts: Array<DcsJs.CampaignAircraft> | undefined, id: string) => {
	return activeAircrafts?.find((ac) => ac.id === id);
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
