import { CampaignAircraft, CampaignFlightGroup } from "@kilcekru/dcc-shared-rpc-types";

import { airdromes } from "./data";
import {
	calcPackageEndTime,
	distanceToPosition,
	findInside,
	getUsableAircrafts,
	Minutes,
	objectiveNamesToObjectives,
	random,
	randomCallSign,
	randomItem,
} from "./utils";

export const generateCASPackage = (
	activeAircrafts: Array<CampaignAircraft> | undefined,
	objectiveNames: Array<string> | undefined,
	timer: number
) => {
	const usableAircrafts = getUsableAircrafts(activeAircrafts, "CAS");

	const kobuleti = airdromes.find((drome) => drome.name === "Kobuleti");

	if (kobuleti == null) {
		throw "Kobuleti not found";
	}

	const objectivesInRange = findInside(
		objectiveNamesToObjectives(objectiveNames),
		kobuleti.position,
		(obj) => obj?.position,
		60000
	);

	const selectedObjective = randomItem(objectivesInRange);

	if (selectedObjective == null) {
		throw "no objective found";
	}

	const distanceToObjective = distanceToPosition(kobuleti.position, selectedObjective.position);
	const speed = 170;
	const durationEnRoute = distanceToObjective / speed;

	const startTime = timer + Minutes(random(20, 35));
	const endTakeOffTime = startTime + Minutes(5);
	const endEnRouteTime = endTakeOffTime + 1 + durationEnRoute;
	const endCASTime = endEnRouteTime + 1 + Minutes(30);
	const endLandingTime = endCASTime + 1 + durationEnRoute;

	const flightGroup: CampaignFlightGroup = {
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

	const startTime = timer + Minutes(random(20, 35));
	const tot = startTime + Minutes(15);
	const landingTime = tot + Minutes(45);

	const flightGroup: CampaignFlightGroup = {
		aircraftIds: usableAircrafts?.slice(0, 2).map((aircraft) => aircraft.id) ?? [],
		name: randomCallSign(),
		task: "CAP",
		startTime,
		tot,
		landingTime,
		waypoints: [],
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
