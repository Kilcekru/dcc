import { CampaignCoalition, CampaignFlightGroup } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId, useContext } from "solid-js";

import { CampaignContext } from "./components";
import { airdromes } from "./data";
import { useCalcOppositeHeading, useFaction } from "./hooks";
import {
	calcPackageEndTime,
	findInside,
	firstItem,
	getDurationEnRoute,
	getUsableAircrafts,
	getUsableAircraftsByType,
	Minutes,
	positionFromHeading,
	random,
	randomCallSign,
	randomItem,
} from "./utils";

export const useCas = (coalition: CampaignCoalition) => {
	const [state] = useContext(CampaignContext);
	const faction = useFaction(coalition);

	return () => {
		const usableAircrafts = getUsableAircrafts(faction?.activeAircrafts, "CAS");

		const airdromeName = firstItem(faction?.airdromes);
		const airdrome = airdromes.find((drome) => drome.name === airdromeName);

		if (airdromeName == null || airdrome == null) {
			throw "airdrome not found";
		}

		const objectivesWithAliveUnits = state.objectives?.filter(
			(obj) => obj.units.filter((unit) => unit.alive === true).length > 0
		);
		const objectivesInRange = findInside(objectivesWithAliveUnits, airdrome.position, (obj) => obj?.position, 60000);

		const selectedObjective = randomItem(objectivesInRange);

		if (selectedObjective == null) {
			throw "no objective found";
		}

		const speed = 170;
		const durationEnRoute = getDurationEnRoute(airdrome.position, selectedObjective.position, speed);

		const startTime = state.timer + Minutes(random(20, 35));
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
					position: airdrome.position,
					endPosition: airdrome.position,
					time: startTime,
					endTime: endTakeOffTime,
					speed,
				},
				{
					name: "En Route",
					position: airdrome.position,
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
					endPosition: airdrome.position,
					speed,
					time: endCASTime + 1,
					endTime: endLandingTime,
				},
			],
			objective: selectedObjective,
		};

		const flightGroups = [flightGroup];

		return {
			coalition,
			task: "CAS",
			startTime,
			endTime: calcPackageEndTime(flightGroups),
			airdrome: airdromeName,
			flightGroups,
		};
	};
};

const useCap = (coalition: CampaignCoalition) => {
	const [state] = useContext(CampaignContext);
	const faction = useFaction(coalition);
	const calcOppositeHeading = useCalcOppositeHeading(coalition);

	return () => {
		const usableAircrafts = getUsableAircrafts(faction?.activeAircrafts, "CAP");

		const speed = 170;

		const airdromeName = firstItem(faction?.airdromes);
		const airdrome = airdromes.find((drome) => drome.name === airdromeName);

		if (airdromeName == null || airdrome == null) {
			throw "airdrome not found";
		}

		const endPosition = positionFromHeading(airdrome.position, calcOppositeHeading(airdrome.position), 20000);
		const durationEnRoute = getDurationEnRoute(airdrome.position, endPosition, speed);

		const startTime = state.timer + Minutes(random(20, 35));
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
					position: airdrome.position,
					endPosition: airdrome.position,
					time: startTime,
					endTime: endTakeOffTime,
					speed,
				},
				{
					name: "En Route",
					position: airdrome.position,
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
					endPosition: airdrome.position,
					speed,
					time: endOnStationTime + 1,
					endTime: endLandingTime,
				},
			],
		};

		const flightGroups = [flightGroup];

		return {
			coalition,
			task: "CAP",
			startTime,
			endTime: calcPackageEndTime(flightGroups),
			airdrome: airdromeName,
			flightGroups,
		};
	};
};

const useAwacs = (coalition: CampaignCoalition) => {
	const [state] = useContext(CampaignContext);
	const faction = useFaction(coalition);
	const calcOppositeHeading = useCalcOppositeHeading(coalition);

	return () => {
		const usableAircrafts = getUsableAircraftsByType(faction?.activeAircrafts, faction?.awacs);

		const speed = 170;

		const airdromeName = firstItem(faction?.airdromes);
		const airdrome = airdromes.find((drome) => drome.name === airdromeName);

		if (airdromeName == null || airdrome == null) {
			throw "airdrome not found";
		}

		const endPosition = positionFromHeading(airdrome.position, calcOppositeHeading(airdrome.position) + 180, 20000);
		const durationEnRoute = getDurationEnRoute(airdrome.position, endPosition, speed);

		const startTime = state.timer + Minutes(random(20, 35));
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
					position: airdrome.position,
					endPosition: airdrome.position,
					time: startTime,
					endTime: endTakeOffTime,
					speed,
				},
				{
					name: "En Route",
					position: airdrome.position,
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
					endPosition: airdrome.position,
					speed,
					time: endOnStationTime + 1,
					endTime: endLandingTime,
				},
			],
		};

		const flightGroups = [flightGroup];

		return {
			coalition,
			task: "AWACS",
			startTime,
			endTime: calcPackageEndTime(flightGroups),
			airdrome: airdromeName,
			flightGroups,
		};
	};
};

export const useGeneratePackage = (coalition: CampaignCoalition) => {
	const awacs = useAwacs(coalition);
	const cas = useCas(coalition);
	const cap = useCap(coalition);

	return {
		awacs,
		cas,
		cap,
	};
};
