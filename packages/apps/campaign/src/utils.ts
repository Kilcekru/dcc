import {
	CampaignAircraft,
	CampaignAircraftState,
	CampaignCoalition,
	CampaignFlightGroup,
	CampaignObjective,
	CampaignPackage,
} from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import { Aircraft as DataAircraft, CallSigns, Objectives } from "./data";
import { Aircraft, MapPosition, Objective, Position, Task } from "./types";
import { AircraftType } from "./types/aircraftType";

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

export const generateInitAircraftInventory = (
	availableAircraftTypes: Array<AircraftType>,
	awacsAircraftTypes: Array<AircraftType>,
	casAirdromePosition: Position,
	mainAidromePosition: Position
) => {
	const capCount = 8;
	const casCount = 4;
	const strikeCount = 4;
	const awacsCount = 2;

	const availableAircrafts = availableAircraftTypes.map((aircraftType) => DataAircraft[aircraftType]!);
	const availableAWACSAircrafts = awacsAircraftTypes.reduce((prev, acType) => {
		const ac = DataAircraft[acType];

		if (ac == null) {
			return prev;
		} else {
			return [...prev, ac];
		}
	}, [] as Array<Aircraft>);
	const availableCAPAircrafts = availableAircrafts.filter((aircraft) =>
		aircraft.availableTasks.some((task) => task === "CAP")
	);
	const availableCASAircrafts = availableAircrafts.filter((aircraft) =>
		aircraft.availableTasks.some((task) => task === "CAS")
	);
	const availableStrikeAircrafts = availableAircrafts.filter((aircraft) =>
		aircraft.availableTasks.some((task) => task === "Pinpoint Strike")
	);

	const aircrafts: Array<CampaignAircraft> = [];

	availableCAPAircrafts.forEach((aircraft) => {
		const count = Math.min(2, capCount * availableCAPAircrafts.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: aircraft.name,
				position: mainAidromePosition,
				state: "idle",
				id: createUniqueId(),
				availableTasks: aircraft.availableTasks,
			});
		});
	});

	availableCASAircrafts.forEach((aircraft) => {
		const count = Math.min(2, casCount * availableCASAircrafts.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: aircraft.name,
				position: casAirdromePosition,
				state: "idle",
				id: createUniqueId(),
				availableTasks: aircraft.availableTasks,
			});
		});
	});

	availableStrikeAircrafts.forEach((aircraft) => {
		const count = Math.min(2, strikeCount * availableStrikeAircrafts.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: aircraft.name,
				position: mainAidromePosition,
				state: "idle",
				id: createUniqueId(),
				availableTasks: aircraft.availableTasks,
			});
		});
	});

	availableAWACSAircrafts.forEach((ac) => {
		const count = Math.min(2, awacsCount * availableAWACSAircrafts.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: ac.name,
				position: mainAidromePosition,
				state: "idle",
				id: createUniqueId(),
				availableTasks: ac.availableTasks,
			});
		});
	});

	return aircrafts;
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
			return (
				(position.x - sourcePosition.x) * (position.x - sourcePosition.x) +
					(position.y - sourcePosition.y) * (position.y - sourcePosition.y) <=
				radius * radius
			);
		}) ?? []
	);
};

export const objectiveNamesToObjectives = (names: Array<string> | undefined) => {
	if (names == null) {
		return [];
	}

	return names.reduce((prev, name) => {
		const obj = Objectives.find((obj) => obj.name === name);

		if (obj == null) {
			return prev;
		} else {
			return [...prev, obj];
		}
	}, [] as Array<Objective>);
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

export const getActiveWaypoint = (fg: CampaignFlightGroup, timer: number) => {
	return fg.waypoints.find((wp) => wp.time <= timer && wp.endTime >= timer);
};

export const calcFlightGroupPosition = (fg: CampaignFlightGroup, timer: number) => {
	const activeWaypoint = getActiveWaypoint(fg, timer);

	return activeWaypoint?.name === "En Route" || activeWaypoint?.name === "Landing"
		? positionAfterDurationToPosition(
				activeWaypoint.position,
				activeWaypoint.endPosition,
				timer - activeWaypoint.time,
				170
		  )
		: activeWaypoint?.position;
};

export const firstItem = <T>(arr: Array<T> | undefined) => {
	return arr?.[0];
};

export const lastItem = <T>(arr: Array<T>) => {
	return arr[arr.length - 1];
};

export const calcPackageEndTime = (fgs: Array<CampaignFlightGroup>) => {
	return fgs.reduce((prev, fg) => {
		if (fg.landingTime > prev) {
			return fg.landingTime;
		} else {
			return prev;
		}
	}, 0);
};

export const getFlightGroups = (packages: Array<CampaignPackage> | undefined) => {
	return (
		packages?.reduce((prev, pkg) => {
			return [...prev, ...pkg.flightGroups];
		}, [] as Array<CampaignFlightGroup>) ?? []
	);
};

export const getUsableAircrafts = (activeAircrafts: Array<CampaignAircraft> | undefined, task: Task) => {
	return activeAircrafts?.filter(
		(aircraft) => aircraft.state === "idle" && aircraft.availableTasks.some((aircraftTask) => aircraftTask === task)
	);
};

export const getUsableAircraftsByType = (
	activeAircrafts: Array<CampaignAircraft> | undefined,
	aircraftTypes: Array<string> | undefined
) => {
	return activeAircrafts?.filter(
		(aircraft) => aircraft.state === "idle" && aircraftTypes?.some((acType) => aircraft.aircraftType === acType)
	);
};

export const getAircraftStateFromFlightGroup = (fg: CampaignFlightGroup, timer: number): CampaignAircraftState => {
	const activeWaypoint = getActiveWaypoint(fg, timer);

	switch (activeWaypoint?.name) {
		case "En Route":
			return "en route";
		case "CAS":
			return "on station";
		case "Landing":
			return "rtb";
		default:
			return "idle";
	}
};

export const getAircraftFromId = (activeAircrafts: Array<CampaignAircraft> | undefined, id: string) => {
	return activeAircrafts?.find((ac) => ac.id === id);
};

export const filterObjectiveCoalition = (objectives: Array<CampaignObjective>, coalition: CampaignCoalition) => {
	return objectives.filter((obj) => obj.coalition === coalition);
};

export const getDurationEnRoute = (startPosition: Position, endPosition: Position, speed: number) => {
	const distanceToObjective = distanceToPosition(startPosition, endPosition);
	return distanceToObjective / speed;
};
