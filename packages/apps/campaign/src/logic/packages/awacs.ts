import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import {
	addHeading,
	calcPackageEndTime,
	distanceToPosition,
	firstItem,
	getDurationEnRoute,
	getUsableAircraftsByType,
	headingToPosition,
	Minutes,
	objectToPosition,
	positionFromHeading,
} from "../../utils";
import { RunningCampaignState } from "../types";
import { calcLandingWaypoints, calcNearestOppositeAirdrome, generateCallSign, getCoalitionFaction } from "../utils";

export const generateAwacsPackage = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: DataStore,
	startTime: number
): DcsJs.CampaignPackage | undefined => {
	const faction = getCoalitionFaction(coalition, state);

	if (faction == null || dataStore?.airdromes == null) {
		return;
	}

	const usableAircrafts = getUsableAircraftsByType(faction?.inventory.aircrafts, faction?.aircraftTypes.awacs);

	if (usableAircrafts == null || usableAircrafts.length === 0) {
		return;
	}

	const speed = 170;

	const airdromeName = firstItem(faction.airdromeNames);

	if (airdromeName == null) {
		throw `airdrome not found: ${airdromeName ?? ""}`;
	}

	const airdrome = dataStore.airdromes[airdromeName];

	const oppAirdrome = calcNearestOppositeAirdrome(coalition, state, dataStore, airdrome);
	const endPosition = positionFromHeading(airdrome, headingToPosition(oppAirdrome, airdrome), 20000);
	const durationEnRoute = getDurationEnRoute(airdrome, endPosition, speed);
	const headingObjectiveToAirdrome = headingToPosition(endPosition, oppAirdrome);
	const racetrackStart = positionFromHeading(endPosition, addHeading(headingObjectiveToAirdrome, -90), 40_000);
	const racetrackEnd = positionFromHeading(endPosition, addHeading(headingObjectiveToAirdrome, 90), 40_000);
	const duration = Minutes(120);

	const endEnRouteTime = startTime + durationEnRoute;
	const endOnStationTime = endEnRouteTime + 1 + duration;
	const [, landingWaypoints, landingTime] = calcLandingWaypoints(racetrackEnd, airdrome, endOnStationTime + 1);

	const cs = generateCallSign(state, dataStore, "awacs");

	const flightGroup: DcsJs.CampaignFlightGroup = {
		id: createUniqueId(),
		airdromeName,
		units:
			usableAircrafts?.slice(0, 1).map((aircraft, i) => ({
				id: aircraft.id,
				callSign: `${cs.unit}${i + 1}`,
				name: `${cs.flightGroup}-${i + 1}`,
				client: false,
			})) ?? [],
		name: cs.flightGroup,
		task: "AWACS",
		startTime,
		tot: endEnRouteTime + 1,
		landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(airdrome),
				endPosition: racetrackStart,
				time: startTime,
				endTime: endEnRouteTime,
				speed,
				onGround: true,
			},
			{
				name: "Track-race start",
				position: racetrackStart,
				endPosition: objectToPosition(airdrome),
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
			...landingWaypoints,
		],
		position: objectToPosition(airdrome),
	};

	const flightGroups = [flightGroup];

	return {
		task: "AWACS" as DcsJs.Task,
		startTime,
		taskEndTime: endOnStationTime,
		endTime: calcPackageEndTime(flightGroups),
		flightGroups,
		id: createUniqueId(),
	};
};
