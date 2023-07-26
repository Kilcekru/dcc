import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import {
	calcPackageEndTime,
	distanceToPosition,
	firstItem,
	getDurationEnRoute,
	getUsableAircraftsByType,
	Minutes,
	objectToPosition,
} from "../../utils";
import { getAwacsTarget } from "../targetSelection";
import { RunningCampaignState } from "../types";
import { calcLandingWaypoints, generateCallSign, getCoalitionFaction } from "../utils";
import { getCruiseSpeed, updateAircraftForFlightGroup } from "./utils";

export const generateAwacsPackage = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	startTime: number,
): DcsJs.CampaignPackage | undefined => {
	const faction = getCoalitionFaction(coalition, state);

	if (faction == null || dataStore?.airdromes == null) {
		return;
	}

	const usableAircrafts = getUsableAircraftsByType(state, coalition, faction?.aircraftTypes.AWACS, 1);

	if (usableAircrafts == null || usableAircrafts.length === 0) {
		return;
	}

	const cruiseSpeed = getCruiseSpeed(usableAircrafts, dataStore);

	const airdromeName = firstItem(faction.airdromeNames);

	if (airdromeName == null) {
		throw `airdrome not found: ${airdromeName ?? ""}`;
	}

	const airdrome = dataStore.airdromes[airdromeName];

	if (airdrome == null) {
		throw `generateAwacsPackage: airdrome not found: ${airdromeName ?? ""}`;
	}

	const raceTracks = getAwacsTarget(coalition, state, dataStore);

	if (raceTracks == null) {
		return;
	}

	const [racetrackStart, racetrackEnd] = raceTracks;
	const durationEnRoute = getDurationEnRoute(airdrome, racetrackStart, cruiseSpeed);
	const duration = Minutes(120);

	const endEnRouteTime = startTime + durationEnRoute;
	const endOnStationTime = endEnRouteTime + 1 + duration;
	const [landingWaypoints, landingTime] = calcLandingWaypoints(
		racetrackEnd,
		airdrome,
		endOnStationTime + 1,
		cruiseSpeed,
	);

	const cs = generateCallSign(coalition, state, dataStore, "awacs");

	const flightGroup: DcsJs.CampaignFlightGroup = {
		id: createUniqueId() + "-" + String(startTime),
		airdromeName,
		units:
			usableAircrafts?.slice(0, 1).map((aircraft, i) => ({
				id: aircraft.id,
				callSign: cs.unitCallSign(i),
				name: cs.unitName(i),
				client: false,
			})) ?? [],
		name: cs.flightGroupName,
		task: "AWACS",
		startTime,
		tot: endEnRouteTime + 1,
		landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(airdrome),
				time: startTime,
				speed: cruiseSpeed,
				onGround: true,
			},
			{
				name: "Track-race start",
				position: racetrackStart,
				speed: cruiseSpeed,
				time: endEnRouteTime + 1,
				duration,
				taskStart: true,
				racetrack: {
					position: racetrackEnd,
					name: "Track-race end",
					distance: distanceToPosition(racetrackStart, racetrackEnd),
					duration: getDurationEnRoute(racetrackStart, racetrackEnd, cruiseSpeed),
				},
			},
			...landingWaypoints,
		],
		position: objectToPosition(airdrome),
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	const flightGroups = [flightGroup];

	return {
		task: "AWACS" as DcsJs.Task,
		startTime,
		taskEndTime: endOnStationTime,
		endTime: calcPackageEndTime(flightGroups),
		flightGroups,
		frequency: 251,
		id: createUniqueId(),
	};
};
