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
	oppositeCoalition,
	positionFromHeading,
	random,
	randomCallSign,
} from "../../utils";
import { useTargetSelection } from "./targetSelection";

export const useCas = (coalition: DcsJs.CampaignCoalition) => {
	const [state] = useContext(CampaignContext);
	const faction = useFaction(coalition);
	const targetSelection = useTargetSelection(coalition);

	return () => {
		const usableAircrafts = getUsableAircrafts(faction?.inventory.aircrafts, "CAS");

		if (usableAircrafts == null || usableAircrafts.length === 0) {
			return;
		}

		const airdromeName = firstItem(faction?.airdromeNames);
		const airdrome = airdromes.find((drome) => drome.name === airdromeName);

		if (airdromeName == null || airdrome == null) {
			throw `airdrome not found: ${airdromeName ?? ""}`;
		}

		const selectedObjective = targetSelection.casTarget(airdrome.position);

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
		const endEnRouteTime = startTime + durationEnRoute;
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
					endPosition: racetrackStart,
					time: startTime,
					endTime: endEnRouteTime,
					speed,
				},
				{
					name: "Track-race start",
					position: racetrackStart,
					endPosition: airdrome.position,
					speed,
					duration: casDuration,
					time: endEnRouteTime + 1,
					endTime: endCASTime,
					taskStart: true,
					racetrack: {
						position: racetrackEnd,
						name: "Track-race end",
						distance: distanceToPosition(racetrackStart, racetrackEnd),
						duration: getDurationEnRoute(racetrackStart, racetrackEnd, speed),
					},
				},
				{
					name: "Landing",
					position: airdrome.position,
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
			task: "CAS" as DcsJs.Task,
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

		if (usableAircrafts == null || usableAircrafts.length === 0) {
			return;
		}

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

		const endEnRouteTime = startTime + durationEnRoute;
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
					endPosition: racetrackStart,
					time: startTime,
					endTime: endEnRouteTime,
					speed,
				},
				{
					name: "Track-race start",
					position: racetrackStart,
					endPosition: airdrome.position,
					speed,
					duration,
					time: endEnRouteTime + 1,
					endTime: endOnStationTime,
					taskStart: true,
					racetrack: {
						position: racetrackEnd,
						name: "Track-race end",
						distance: distanceToPosition(racetrackStart, racetrackEnd),
						duration: getDurationEnRoute(racetrackStart, racetrackEnd, speed),
					},
				},
				{
					name: "Landing",
					position: airdrome.position,
					endPosition: airdrome.position,
					speed,
					time: endOnStationTime + 1,
					endTime: endLandingTime,
				},
			],
			position: airdrome.position,
			objective: {
				coalition: oppositeCoalition(coalition),
				name: "CAP",
				position: endPosition,
				structures: [],
				units: [],
			},
		};

		const flightGroups = [flightGroup];

		return {
			coalition,
			task: "CAP" as DcsJs.Task,
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

		if (usableAircrafts == null || usableAircrafts.length === 0) {
			return;
		}

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

		const endEnRouteTime = startTime + durationEnRoute;
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
					endPosition: racetrackStart,
					time: startTime,
					endTime: endEnRouteTime,
					speed,
				},
				{
					name: "Track-race start",
					position: racetrackStart,
					endPosition: airdrome.position,
					speed,
					time: endEnRouteTime + 1,
					endTime: endOnStationTime,
					duration,
					taskStart: true,
					racetrack: {
						position: racetrackEnd,
						name: "Track-race end",
						distance: distanceToPosition(racetrackStart, racetrackEnd),
						duration: getDurationEnRoute(racetrackStart, racetrackEnd, speed),
					},
				},
				{
					name: "Landing",
					position: airdrome.position,
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
			task: "AWACS" as DcsJs.Task,
			startTime,
			endTime: calcPackageEndTime(flightGroups),
			airdrome: airdromeName,
			flightGroups,
		};
	};
};

const useDead = (coalition: DcsJs.CampaignCoalition) => {
	const [state] = useContext(CampaignContext);
	const faction = useFaction(coalition);
	const targetSelection = useTargetSelection(coalition);

	return () => {
		const usableAircrafts = getUsableAircrafts(faction?.inventory.aircrafts, "DEAD");

		if (usableAircrafts == null || usableAircrafts.length === 0) {
			return;
		}

		const airdromeName = firstItem(faction?.airdromeNames);
		const airdrome = airdromes.find((drome) => drome.name === airdromeName);

		if (airdromeName == null || airdrome == null) {
			throw `airdrome not found: ${airdromeName ?? ""}`;
		}

		const selectedObjective = targetSelection.deadTarget(airdrome.position);

		if (selectedObjective == null) {
			return;
		}

		const speed = 170;
		const durationEnRoute = getDurationEnRoute(airdrome.position, selectedObjective.position, speed);

		const startTime = Math.floor(state.timer) + Minutes(random(40, 50));
		const endEnRouteTime = startTime + durationEnRoute;
		const endLandingTime = endEnRouteTime + 1 + durationEnRoute;

		const flightGroup: DcsJs.CampaignFlightGroup = {
			id: createUniqueId(),
			airdromeName,
			aircraftIds: usableAircrafts?.slice(0, 2).map((aircraft) => aircraft.id) ?? [],
			name: randomCallSign(),
			task: "DEAD",
			startTime,
			tot: endEnRouteTime + 1,
			landingTime: endLandingTime,
			waypoints: [
				{
					name: "Take Off",
					position: airdrome.position,
					endPosition: selectedObjective.position,
					time: startTime,
					endTime: endEnRouteTime,
					speed,
				},
				{
					name: "DEAD",
					position: selectedObjective.position,
					endPosition: airdrome.position,
					time: endEnRouteTime + 1,
					endTime: endEnRouteTime + 1,
					speed,
				},
				{
					name: "Landing",
					position: airdrome.position,
					endPosition: airdrome.position,
					speed,
					time: endEnRouteTime + 2,
					endTime: endLandingTime,
				},
			],
			objective: {
				name: selectedObjective.id,
				coalition: oppositeCoalition(coalition),
				position: selectedObjective.position,
				structures: [],
				units: [],
			},
			position: airdrome.position,
		};

		const flightGroups = [flightGroup];

		return {
			coalition,
			task: "DEAD" as DcsJs.Task,
			startTime,
			endTime: calcPackageEndTime(flightGroups),
			airdrome: airdromeName,
			flightGroups,
		};
	};
};

export const useStrike = (coalition: DcsJs.CampaignCoalition) => {
	const [state] = useContext(CampaignContext);
	const faction = useFaction(coalition);
	const targetSelection = useTargetSelection(coalition);

	return () => {
		const usableAircrafts = getUsableAircrafts(faction?.inventory.aircrafts, "Pinpoint Strike");

		if (usableAircrafts == null || usableAircrafts.length === 0) {
			return;
		}

		const airdromeName = firstItem(faction?.airdromeNames);
		const airdrome = airdromes.find((drome) => drome.name === airdromeName);

		if (airdromeName == null || airdrome == null) {
			throw `airdrome not found: ${airdromeName ?? ""}`;
		}

		const selectedObjective = targetSelection.strikeTarget(airdrome.position);

		if (selectedObjective == null) {
			return;
		}

		const speed = 170;
		const durationEnRoute = getDurationEnRoute(airdrome.position, selectedObjective.position, speed);

		const startTime = Math.floor(state.timer) + Minutes(random(30, 60));
		const endEnRouteTime = startTime + durationEnRoute;
		const endLandingTime = endEnRouteTime + 1 + durationEnRoute;

		const flightGroup: DcsJs.CampaignFlightGroup = {
			id: createUniqueId(),
			airdromeName,
			aircraftIds: usableAircrafts?.slice(0, 2).map((aircraft) => aircraft.id) ?? [],
			name: randomCallSign(),
			task: "Pinpoint Strike",
			startTime,
			tot: endEnRouteTime + 1,
			landingTime: endLandingTime,
			waypoints: [
				{
					name: "Take Off",
					position: airdrome.position,
					endPosition: selectedObjective.position,
					time: startTime,
					endTime: endEnRouteTime,
					speed,
				},
				{
					name: "Pinpoint Strike",
					position: selectedObjective.position,
					endPosition: airdrome.position,
					speed,
					time: endEnRouteTime + 1,
					endTime: endEnRouteTime + 1,
				},
				{
					name: "Landing",
					position: airdrome.position,
					endPosition: airdrome.position,
					speed,
					time: endEnRouteTime + 2,
					endTime: endLandingTime,
				},
			],
			objective: selectedObjective,
			position: airdrome.position,
		};

		const flightGroups = [flightGroup];

		return {
			coalition,
			task: "Pinpoint Strike" as DcsJs.Task,
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
	const dead = useDead(coalition);
	const strike = useStrike(coalition);

	return {
		awacs,
		cas,
		cap,
		dead,
		strike,
	};
};
