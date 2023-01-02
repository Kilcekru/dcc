import { CampaignAircraft, CampaignFlightGroup, CampaignObjective } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import { airdromes } from "./data";
import {
	calcPackageEndTime,
	findInside,
	getDurationEnRoute,
	getUsableAircrafts,
	getUsableAircraftsByType,
	Minutes,
	positionFromHeading,
	random,
	randomCallSign,
	randomItem,
} from "./utils";

export const generateCASPackage = (
	activeAircrafts: Array<CampaignAircraft> | undefined,
	objectives: Array<CampaignObjective> | undefined,
	timer: number
) => {
	const usableAircrafts = getUsableAircrafts(activeAircrafts, "CAS");

	const kobuleti = airdromes.find((drome) => drome.name === "Kobuleti");

	if (kobuleti == null) {
		throw "Kobuleti not found";
	}

	const objectivesWithAliveUnits = objectives?.filter(
		(obj) => obj.units.filter((unit) => unit.alive === true).length > 0
	);
	const objectivesInRange = findInside(objectivesWithAliveUnits, kobuleti.position, (obj) => obj?.position, 60000);

	const selectedObjective = randomItem(objectivesInRange);

	if (selectedObjective == null) {
		throw "no objective found";
	}

	const speed = 170;
	const durationEnRoute = getDurationEnRoute(kobuleti.position, selectedObjective.position, speed);

	const startTime = timer + Minutes(random(20, 35));
	const endTakeOffTime = startTime + Minutes(5);
	const endEnRouteTime = endTakeOffTime + 1 + durationEnRoute;
	const endCASTime = endEnRouteTime + 1 + Minutes(30);
	const endLandingTime = endCASTime + 1 + durationEnRoute;

	const flightGroup: CampaignFlightGroup = {
		id: createUniqueId(),
		aircraftIds: usableAircrafts?.slice(0, 2).map((aircraft) => aircraft.id) ?? [],
		name: randomCallSign(),
		task: "CAS",
		startTime,
		tot: endEnRouteTime + 1,
		landingTime: endLandingTime,
		waypoints: [
			{
				name: "Take Off",
				position: kobuleti.position,
				endPosition: kobuleti.position,
				time: startTime,
				endTime: endTakeOffTime,
				speed,
			},
			{
				name: "En Route",
				position: kobuleti.position,
				endPosition: selectedObjective.position,
				speed,
				time: endTakeOffTime + 1,
				endTime: endEnRouteTime,
			},
			{
				name: "CAS",
				position: selectedObjective.position,
				endPosition: selectedObjective.position,
				speed,
				time: endEnRouteTime + 1,
				endTime: endCASTime,
			},
			{
				name: "Landing",
				position: selectedObjective.position,
				endPosition: kobuleti.position,
				speed,
				time: endCASTime + 1,
				endTime: endLandingTime,
			},
		],
		objective: selectedObjective,
	};

	const flightGroups = [flightGroup];

	return {
		side: "blue" as "blue" | "red",
		task: "CAS",
		startTime,
		endTime: calcPackageEndTime(flightGroups),
		airdrome: "Kobuleti",
		flightGroups,
	};
};

export const generateCAPPackage = (activeAircrafts: Array<CampaignAircraft> | undefined, timer: number) => {
	const usableAircrafts = getUsableAircrafts(activeAircrafts, "CAP");

	const speed = 170;

	const kobuleti = airdromes.find((drome) => drome.name === "Kobuleti");

	if (kobuleti == null) {
		throw "Kobuleti not found";
	}

	const endPosition = positionFromHeading(kobuleti.position, 0, 20000);
	const durationEnRoute = getDurationEnRoute(kobuleti.position, endPosition, speed);

	const startTime = timer + Minutes(random(20, 35));
	const endTakeOffTime = startTime + Minutes(5);

	const endEnRouteTime = endTakeOffTime + 1 + durationEnRoute;
	const endOnStationTime = endEnRouteTime + 1 + Minutes(60);
	const endLandingTime = endOnStationTime + 1 + durationEnRoute;

	const flightGroup: CampaignFlightGroup = {
		id: createUniqueId(),
		aircraftIds: usableAircrafts?.slice(0, 2).map((aircraft) => aircraft.id) ?? [],
		name: randomCallSign(),
		task: "CAP",
		startTime,
		tot: endEnRouteTime + 1,
		landingTime: endLandingTime,
		waypoints: [
			{
				name: "Take Off",
				position: kobuleti.position,
				endPosition: kobuleti.position,
				time: startTime,
				endTime: endTakeOffTime,
				speed,
			},
			{
				name: "En Route",
				position: kobuleti.position,
				endPosition: endPosition,
				speed,
				time: endTakeOffTime + 1,
				endTime: endEnRouteTime,
			},
			{
				name: "On Station",
				position: endPosition,
				endPosition: endPosition,
				speed,
				time: endEnRouteTime + 1,
				endTime: endOnStationTime,
			},
			{
				name: "Landing",
				position: endPosition,
				endPosition: kobuleti.position,
				speed,
				time: endOnStationTime + 1,
				endTime: endLandingTime,
			},
		],
	};

	const flightGroups = [flightGroup];

	return {
		side: "blue" as "blue" | "red",
		task: "CAP",
		startTime,
		endTime: calcPackageEndTime(flightGroups),
		airdrome: "Kobuleti",
		flightGroups,
	};
};

export const generateAWACSPackage = (
	activeAircrafts: Array<CampaignAircraft> | undefined,
	aircraftTypes: Array<string> | undefined,
	timer: number
) => {
	const usableAircrafts = getUsableAircraftsByType(activeAircrafts, aircraftTypes);

	const speed = 170;

	const kobuleti = airdromes.find((drome) => drome.name === "Kobuleti");

	if (kobuleti == null) {
		throw "Kobuleti not found";
	}

	const endPosition = positionFromHeading(kobuleti.position, 180, 20000);
	const durationEnRoute = getDurationEnRoute(kobuleti.position, endPosition, speed);

	const startTime = timer + Minutes(random(20, 35));
	const endTakeOffTime = startTime + Minutes(5);

	const endEnRouteTime = endTakeOffTime + 1 + durationEnRoute;
	const endOnStationTime = endEnRouteTime + 1 + Minutes(60);
	const endLandingTime = endOnStationTime + 1 + durationEnRoute;

	const flightGroup: CampaignFlightGroup = {
		id: createUniqueId(),
		aircraftIds: usableAircrafts?.slice(0, 1).map((aircraft) => aircraft.id) ?? [],
		name: randomCallSign(),
		task: "AWACS",
		startTime,
		tot: endEnRouteTime + 1,
		landingTime: endLandingTime,
		waypoints: [
			{
				name: "Take Off",
				position: kobuleti.position,
				endPosition: kobuleti.position,
				time: startTime,
				endTime: endTakeOffTime,
				speed,
			},
			{
				name: "En Route",
				position: kobuleti.position,
				endPosition: endPosition,
				speed,
				time: endTakeOffTime + 1,
				endTime: endEnRouteTime,
			},
			{
				name: "On Station",
				position: endPosition,
				endPosition: endPosition,
				speed,
				time: endEnRouteTime + 1,
				endTime: endOnStationTime,
			},
			{
				name: "Landing",
				position: endPosition,
				endPosition: kobuleti.position,
				speed,
				time: endOnStationTime + 1,
				endTime: endLandingTime,
			},
		],
	};

	const flightGroups = [flightGroup];

	return {
		side: "blue" as "blue" | "red",
		task: "AWACS",
		startTime,
		endTime: calcPackageEndTime(flightGroups),
		airdrome: "Kobuleti",
		flightGroups,
	};
};
