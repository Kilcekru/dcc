import type * as DcsJs from "@foxdelta2/dcsjs";
import { createUniqueId, useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { airdromes } from "../../data";
import { useCalcOppositeHeading, useFaction } from "../../hooks";
import {
	calcPackageEndTime,
	distanceToPosition,
	firstItem,
	getDurationEnRoute,
	getUsableAircrafts,
	getUsableAircraftsByType,
	headingToPosition,
	Minutes,
	positionFromHeading,
	random,
	randomCallSign,
} from "../../utils";
import { useTargetSelection } from "./targetSelection";

export const useCas = (coalition: DcsJs.CampaignCoalition) => {
	const [state] = useContext(CampaignContext);
	const faction = useFaction(coalition);
	const targetSelection = useTargetSelection();

	return () => {
		const usableAircrafts = getUsableAircrafts(faction?.inventory.aircrafts, "CAS");

		const airdromeName = firstItem(faction?.airdromeNames);
		const airdrome = airdromes.find((drome) => drome.name === airdromeName);

		if (airdromeName == null || airdrome == null) {
			throw `airdrome not found: ${airdromeName ?? ""}`;
		}

		const selectedObjective = targetSelection.casTarget(coalition, airdrome.position);

		if (selectedObjective == null) {
			return;
		}

		const speed = 170;
		const headingObjectiveToAirdrome = headingToPosition(selectedObjective.position, airdrome.position);
		const racetrackStart = positionFromHeading(selectedObjective.position, headingObjectiveToAirdrome - 90, 7500);
		const racetrackEnd = positionFromHeading(selectedObjective.position, headingObjectiveToAirdrome + 90, 7500);
		const durationEnRoute = getDurationEnRoute(airdrome.position, selectedObjective.position, speed);
		const casDuration = Minutes(30);

		const startTime = Math.floor(state.timer) + Minutes(random(20, 35));
		const endTakeOffTime = startTime + Minutes(5);
		const endEnRouteTime = endTakeOffTime + 1 + durationEnRoute;
		const endCASTime = endEnRouteTime + 1 + casDuration;
		const endLandingTime = endCASTime + 1 + durationEnRoute;

		const flightGroup: DcsJs.CampaignFlightGroup = {
			id: createUniqueId(),
			airdromeName,
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
					endPosition: racetrackStart,
					speed,
					time: endTakeOffTime + 1,
					endTime: endEnRouteTime,
				},
				{
					name: "CAS",
					position: racetrackStart,
					endPosition: racetrackEnd,
					speed,
					duration: casDuration,
					time: endEnRouteTime + 1,
					endTime: endCASTime,
					racetrack: {
						position: racetrackEnd,
						heading: headingToPosition(racetrackStart, racetrackEnd),
						distance: 15000,
						duration: getDurationEnRoute(racetrackStart, racetrackEnd, speed),
					},
				},
				{
					name: "Landing",
					position: racetrackEnd,
					endPosition: airdrome.position,
					speed,
					time: endCASTime + 1,
					endTime: endLandingTime,
				},
			],
			objective: selectedObjective,
			position: airdrome.position,
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

const useCap = (coalition: DcsJs.CampaignCoalition) => {
	const [state] = useContext(CampaignContext);
	const faction = useFaction(coalition);
	const calcOppositeHeading = useCalcOppositeHeading(coalition);

	return () => {
		const usableAircrafts = getUsableAircrafts(faction?.inventory.aircrafts, "CAP");

		const speed = 170;

		const airdromeName = firstItem(faction?.airdromeNames);
		const airdrome = airdromes.find((drome) => drome.name === airdromeName);

		if (airdromeName == null || airdrome == null) {
			throw `airdrome not found: ${airdromeName ?? ""}`;
		}

		const endPosition = positionFromHeading(airdrome.position, calcOppositeHeading(airdrome.position), 20000);
		const durationEnRoute = getDurationEnRoute(airdrome.position, endPosition, speed);
		const headingObjectiveToAirdrome = headingToPosition(endPosition, airdrome.position);
		const racetrackStart = positionFromHeading(endPosition, headingObjectiveToAirdrome - 90, 20000);
		const racetrackEnd = positionFromHeading(endPosition, headingObjectiveToAirdrome + 90, 20000);
		const duration = Minutes(60);
		const startTime = Math.floor(state.timer) + Minutes(random(20, 35));
		const endTakeOffTime = startTime + Minutes(5);

		const endEnRouteTime = endTakeOffTime + 1 + durationEnRoute;
		const endOnStationTime = endEnRouteTime + 1 + duration;
		const endLandingTime = endOnStationTime + 1 + durationEnRoute;

		const flightGroup: DcsJs.CampaignFlightGroup = {
			id: createUniqueId(),
			aircraftIds: usableAircrafts?.slice(0, 2).map((aircraft) => aircraft.id) ?? [],
			airdromeName,
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
					endPosition: racetrackStart,
					speed,
					time: endTakeOffTime + 1,
					endTime: endEnRouteTime,
				},
				{
					name: "On Station",
					position: racetrackStart,
					endPosition: racetrackEnd,
					speed,
					duration,
					time: endEnRouteTime + 1,
					endTime: endOnStationTime,
					racetrack: {
						position: racetrackEnd,
						heading: headingToPosition(racetrackStart, racetrackEnd),
						distance: 40000,
						duration: getDurationEnRoute(racetrackStart, racetrackEnd, speed),
					},
				},
				{
					name: "Landing",
					position: racetrackEnd,
					endPosition: airdrome.position,
					speed,
					time: endOnStationTime + 1,
					endTime: endLandingTime,
				},
			],
			position: airdrome.position,
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

const useAwacs = (coalition: DcsJs.CampaignCoalition) => {
	const [state] = useContext(CampaignContext);
	const faction = useFaction(coalition);
	const calcOppositeHeading = useCalcOppositeHeading(coalition);

	return () => {
		const usableAircrafts = getUsableAircraftsByType(faction?.inventory.aircrafts, faction?.awacs);

		const speed = 170;

		const airdromeName = firstItem(faction?.airdromeNames);
		const airdrome = airdromes.find((drome) => drome.name === airdromeName);

		if (airdromeName == null || airdrome == null) {
			throw `airdrome not found: ${airdromeName ?? ""}`;
		}

		const endPosition = positionFromHeading(airdrome.position, calcOppositeHeading(airdrome.position) + 180, 20000);
		const durationEnRoute = getDurationEnRoute(airdrome.position, endPosition, speed);
		const headingObjectiveToAirdrome = headingToPosition(endPosition, airdrome.position);
		const racetrackStart = positionFromHeading(endPosition, headingObjectiveToAirdrome - 90, 40_000);
		const racetrackEnd = positionFromHeading(endPosition, headingObjectiveToAirdrome + 90, 40_000);
		const duration = Minutes(60);
		const startTime = Math.floor(state.timer) + Minutes(random(20, 35));
		const endTakeOffTime = startTime + Minutes(5);

		const endEnRouteTime = endTakeOffTime + 1 + durationEnRoute;
		const endOnStationTime = endEnRouteTime + 1 + duration;
		const endLandingTime = endOnStationTime + 1 + durationEnRoute;

		const flightGroup: DcsJs.CampaignFlightGroup = {
			id: createUniqueId(),
			airdromeName,
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
					endPosition: racetrackStart,
					speed,
					time: endTakeOffTime + 1,
					endTime: endEnRouteTime,
				},
				{
					name: "On Station",
					position: racetrackStart,
					endPosition: racetrackEnd,
					speed,
					time: endEnRouteTime + 1,
					endTime: endOnStationTime,
					duration,
					racetrack: {
						position: racetrackEnd,
						heading: headingToPosition(racetrackStart, racetrackEnd),
						distance: distanceToPosition(racetrackStart, racetrackEnd),
						duration: getDurationEnRoute(racetrackStart, racetrackEnd, speed),
					},
				},
				{
					name: "Landing",
					position: racetrackEnd,
					endPosition: airdrome.position,
					speed,
					time: endOnStationTime + 1,
					endTime: endLandingTime,
				},
			],
			position: airdrome.position,
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

export const useGeneratePackage = (coalition: DcsJs.CampaignCoalition) => {
	const awacs = useAwacs(coalition);
	const cas = useCas(coalition);
	const cap = useCap(coalition);

	return {
		awacs,
		cas,
		cap,
	};
};
