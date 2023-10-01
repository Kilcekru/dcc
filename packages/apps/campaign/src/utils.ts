import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { LOtoLL } from "@kilcekru/dcs-coordinates";

import { useDataStore } from "./components/DataProvider";
import { Config, Scenario } from "./data";
import * as Domain from "./domain";
import { RunningCampaignState } from "./logic/types";
import { getCoalitionFaction } from "./logic/utils";
import { MapPosition, Task } from "./types";

export const optionalClass = (className: string, optionalClass?: string) => {
	return className + (optionalClass == null ? "" : " " + optionalClass);
};

export function usePositionToMapPosition() {
	const dataStore = useDataStore();

	return positionToMapPosition(dataStore.map);
}

export const positionToMapPosition =
	(map: DcsJs.MapName) =>
	(pos: { x: number; y: number }): MapPosition => {
		try {
			const latLng = LOtoLL({ map, x: pos.x, z: pos.y });

			return [latLng.lat, latLng.lng];
		} catch (e: unknown) {
			// eslint-disable-next-line no-console
			console.error(e, pos);
			throw new Error("invalid map position");
		}
	};

const isPosition = (value: DcsJs.Position | { position: DcsJs.Position }): value is DcsJs.Position => {
	return (value as DcsJs.Position).x != null;
};
export const objectToPosition = <T extends DcsJs.Position | { position: DcsJs.Position }>(value: T): DcsJs.Position => {
	if (isPosition(value)) {
		return {
			x: value.x,
			y: value.y,
		};
	} else {
		return value.position;
	}
};

export const addHeading = (heading: number, value: number) => {
	let sum = heading + value;

	while (sum < 0) {
		sum += 360;
	}

	return sum % 360;
};

export const findInside = <T>(
	values: Array<T> | undefined,
	sourcePosition: DcsJs.Position,
	positionSelector: (value: T) => DcsJs.Position,
	radius: number,
): Array<T> => {
	return (
		values?.filter((v) => {
			const position = positionSelector(v);
			/* return (
				(position.x - sourcePosition.x) * (position.x - sourcePosition.x) +
					(position.y - sourcePosition.y) * (position.y - sourcePosition.y) <=
				radius * radius
			); */

			return Utils.distanceToPosition(sourcePosition, position) <= radius;
		}) ?? []
	);
};

export const findNearest = <T>(
	values: Array<T> | undefined,
	sourcePosition: DcsJs.Position,
	positionSelector: (value: T) => DcsJs.Position,
) => {
	return values?.reduce(
		([prevObj, prevDistance], v) => {
			const position = positionSelector(v);
			const distance = Utils.distanceToPosition(sourcePosition, position);

			if (distance < prevDistance) {
				return [v, distance] as [T, number];
			} else {
				return [prevObj, prevDistance] as [T, number];
			}
		},
		[undefined, 10000000] as [T, number],
	)[0];
};

export const degreesToRadians = (degrees: number) => {
	// return parseFloat(((degrees * Math.PI) / 180).toFixed(2));
	return (degrees / 360) * 2 * Math.PI;
};

export const positionFromHeading = (pos: DcsJs.Position, heading: number, distance: number): DcsJs.Position => {
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
	sourcePosition: DcsJs.Position,
	targetPosition: DcsJs.Position,
	duration: number,
	speed: number,
): DcsJs.Position => {
	if (duration <= 0) {
		return sourcePosition;
	}

	const distanceTraveled = speed * duration;
	const heading = Utils.headingToPosition(sourcePosition, targetPosition);

	return positionFromHeading(sourcePosition, heading, distanceTraveled);
};

export const getActiveWaypoint = (fg: DcsJs.FlightGroup, timer: number) => {
	return fg.waypoints.reduce(
		(prev, wp) => {
			if (prev == null) {
				return wp;
			}

			const wpTime = fg.startTime + wp.time;

			if (wpTime <= timer) {
				return wp;
			}

			return prev;
		},
		undefined as DcsJs.CampaignWaypoint | undefined,
	);
};

export const getNextWaypoint = (fg: DcsJs.FlightGroup, waypoint: DcsJs.CampaignWaypoint) => {
	return fg.waypoints[fg.waypoints.indexOf(waypoint) + 1];
};

export const calcFlightGroupPosition = (
	fg: DcsJs.FlightGroup,
	lastTickTimer: number,
	timer: number,
	dataStore: Types.Campaign.DataStore,
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
		const nextPosition = nextWaypoint?.position ?? airdrome ?? activeWaypoint.position;
		if (Utils.distanceToPosition(fg.position, nextPosition) <= 2000) {
			return nextPosition;
		}

		return positionAfterDurationToPosition(
			fg.position,
			nextPosition,
			timer - lastTickTimer,
			nextWaypoint?.speed ?? 200,
		);
	} else {
		const timeOnStation = timer - activeWaypoint.time;
		const distancesAlreadyFlown = Math.floor(timeOnStation / activeWaypoint.racetrack.duration);
		// const timeOnTrack = Math.floor(timeOnStation - distancesAlreadyFlown * activeWaypoint.racetrack.duration);

		if (distancesAlreadyFlown % 2 === 0) {
			if (Utils.distanceToPosition(fg.position, activeWaypoint.racetrack.position) <= 1000) {
				return activeWaypoint.racetrack.position;
			}

			return positionAfterDurationToPosition(
				fg.position,
				activeWaypoint.racetrack.position,
				timer - lastTickTimer,
				nextWaypoint?.speed ?? 200,
			);
		} else {
			if (Utils.distanceToPosition(fg.position, activeWaypoint.position) <= 1000) {
				return activeWaypoint.position;
			}

			return positionAfterDurationToPosition(
				fg.position,
				activeWaypoint.position,
				timer - lastTickTimer,
				nextWaypoint?.speed ?? 200,
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

export const calcPackageEndTime = (startTime: number, fgs: Array<DcsJs.FlightGroup>) => {
	return (
		startTime +
		fgs.reduce((prev, fg) => {
			if (fg.landingTime > prev) {
				return fg.landingTime;
			} else {
				return prev;
			}
		}, 0)
	);
};

export const getFlightGroups = (packages: Array<DcsJs.FlightPackage> | undefined) => {
	return (
		packages?.reduce((prev, pkg) => {
			return [...prev, ...pkg.flightGroups];
		}, [] as Array<DcsJs.FlightGroup>) ?? []
	);
};

export const getClientFlightGroups = (packages: Array<DcsJs.FlightPackage> | undefined) => {
	const fgs = getFlightGroups(packages);

	return fgs.filter((fg) => fg.units.some((unit) => unit.client)) ?? [];
};

export const getUsableAircrafts = (activeAircrafts: Array<DcsJs.Aircraft> | undefined, task: Task) => {
	return activeAircrafts?.filter(
		(aircraft) => aircraft.state === "idle" && aircraft.availableTasks.some((aircraftTask) => aircraftTask === task),
	);
};

export const getUsableAircraftsByType = (
	state: RunningCampaignState,
	coalition: DcsJs.CampaignCoalition,
	aircraftTypes: Array<string> | undefined,
	count: number,
): Array<DcsJs.Aircraft> => {
	const faction = getCoalitionFaction(coalition, state);
	const aircrafts = Object.values(faction.inventory.aircrafts ?? []);

	// Filter only aircrafts that are in idle state
	const idleAircrafts = aircrafts.filter((ac) => ac.state === "idle" && ac.disabled !== true);
	// Filter only aircrafts that are alive
	const aliveAircrafts = idleAircrafts.filter((ac) => ac.alive);
	// Filter only aircrafts of specific aircraft types
	const typeAircrafts = aliveAircrafts.filter((ac) => aircraftTypes?.some((acType) => ac.aircraftType === acType));

	// The aircraft types of the remaining aircrafts
	const availableAircraftTypes = typeAircrafts.reduce((prev, ac) => {
		prev.set(ac.aircraftType, (prev.get(ac.aircraftType) ?? 0) + 1);

		return prev;
	}, new Map<string, number>());

	// Filter only aircraft types with the min amount of aircrafts
	const validAircraftTypes = Array.from(availableAircraftTypes)
		.filter(([, acCount]) => acCount >= count)
		.map(([acType]) => acType);

	// Select a random aircraft type from the valid aircraft types
	const selectedAircraftType = Domain.Random.item(validAircraftTypes);

	// Return only aircraft with the selected aircraft type
	return aliveAircrafts.filter((ac) => ac.aircraftType === selectedAircraftType);
};

export const getAircraftStateFromFlightGroup = (
	fg: DcsJs.FlightGroup,
	timer: number,
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
	coalition: DcsJs.CampaignCoalition,
) => {
	return objectives.filter((obj) => obj.coalition === coalition);
};

export const getDurationEnRoute = (startPosition: DcsJs.Position, endPosition: DcsJs.Position, speed: number) => {
	const distanceToObjective = Utils.distanceToPosition(startPosition, endPosition);
	return Math.round(distanceToObjective / speed);
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
	const num = Domain.Random.number(1, 999);

	if (num > 99) {
		return `${num}`;
	} else if (num > 9) {
		return `0${num}`;
	} else {
		return `00${num}`;
	}
};

export const getScenarioFaction = (coalition: DcsJs.CampaignCoalition, scenario: Scenario) => {
	return coalition === "blue" ? scenario.blue : scenario.red;
};

export const sortAsc = <T>(a: T, b: T, fn: (o: T) => number) => {
	return fn(a) - fn(b);
};

export const sortDesc = <T>(a: T, b: T, fn: (o: T) => number) => {
	return fn(b) - fn(a);
};

export const hasStructureInRange = (
	position: DcsJs.Position | undefined,
	faction: DcsJs.CampaignFaction | undefined,
	structureType: DcsJs.StructureType,
	range: number,
) => {
	if (position == null || faction == null) {
		return false;
	}

	const structures = Object.values(faction.structures).filter(
		(str) => str.type === structureType && str.state === "active",
	);

	const inRange = findInside(structures, position, (str) => str.position, range);

	return inRange.length > 0;
};

export const hasPowerInRange = (position: DcsJs.Position | undefined, faction: DcsJs.CampaignFaction | undefined) => {
	return hasStructureInRange(position, faction, "Power Plant", Config.structureRange.power);
};

export const hasAmmoDepotInRange = (
	position: DcsJs.Position | undefined,
	faction: DcsJs.CampaignFaction | undefined,
) => {
	return hasStructureInRange(position, faction, "Ammo Depot", Config.structureRange.ammo);
};

export const hasFuelStorageInRange = (
	position: DcsJs.Position | undefined,
	faction: DcsJs.CampaignFaction | undefined,
) => {
	return hasStructureInRange(position, faction, "Fuel Storage", Config.structureRange.fuel);
};

export const getDeploymentCost = (
	coalition: DcsJs.CampaignCoalition | undefined,
	structureType: DcsJs.StructureType | undefined,
) => {
	if (coalition == null || structureType == null) {
		return 999999;
	}
	const cost =
		structureType === "Depot" ? Config.deploymentScore.frontline.depot : Config.deploymentScore.frontline.barrack;

	return cost * Config.deploymentScore.coalitionMultiplier[coalition === "blue" ? "blue" : "red"];
};

export const AiSkillMap: Record<DcsJs.AiSkill, string> = {
	Average: "Rookie",
	Good: "Trained",
	High: "Veteran",
	Excellent: "Ace",
};

export function timerToDate(value: number) {
	const d = new Date(value * 1000);
	// d.setMinutes(d.getMinutes() + d.getTimezoneOffset());

	return d;
}

export function dateToTimer(value: Date) {
	return value.valueOf() / 1000;
}

export function calcTakeoffTime(packages: Array<DcsJs.FlightPackage> | undefined) {
	return packages?.reduce(
		(prev, pkg) => {
			const hasClients = pkg.flightGroups.some((fg) => fg.units.some((u) => u.client));

			if (hasClients) {
				if (prev == null || pkg.startTime < prev) {
					return pkg.startTime;
				}
			}

			return prev;
		},
		undefined as number | undefined,
	);
}

export function getMissionStateTimer(missionState: Types.Campaign.MissionState, timer: number) {
	const timerDate = timerToDate(timer);

	const additionalDays = timerDate.getDate() - 1;
	const additionalTimer = additionalDays * 86400;

	return missionState.time + additionalTimer;
}

export function awacsFrequency(faction: DcsJs.Faction, dataStore: Types.Campaign.DataStore) {
	const aircraftStore = dataStore.aircrafts;

	if (aircraftStore == null) {
		return 251;
	}

	let limitedFrequency = false;

	Object.values(faction.aircraftTypes).forEach((act) => {
		act.forEach((ac) => {
			const aircraft = aircraftStore[ac as DcsJs.AircraftType];

			if (aircraft == null) {
				return;
			}

			if (aircraft.allowedFrequency == null) {
				return;
			}

			limitedFrequency = true;
		});
	});

	return limitedFrequency ? 144 : 251;
}

export function jtacFrequency(faction: DcsJs.CampaignFaction) {
	const existingJtacFrequency = faction.packages.reduce((prev, pkg) => {
		const fgWithJtac = pkg.flightGroups.find((fg) => fg.jtacFrequency);

		if (fgWithJtac?.jtacFrequency != null && fgWithJtac.jtacFrequency > prev) {
			return fgWithJtac.jtacFrequency;
		}

		return prev;
	}, 240);

	return existingJtacFrequency + 1;
}
