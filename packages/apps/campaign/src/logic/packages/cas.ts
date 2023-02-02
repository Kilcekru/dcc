import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import {
	calcPackageEndTime,
	distanceToPosition,
	firstItem,
	getDurationEnRoute,
	getUsableAircraftsByType,
	headingToPosition,
	Minutes,
	objectToPosition,
	oppositeCoalition,
	positionFromHeading,
	random,
} from "../../utils";
import { getCasTarget } from "../targetSelection";
import { RunningCampaignState } from "../types";
import { calcLandingWaypoints, generateCallSign, getCoalitionFaction, speed } from "../utils";

export const generateCasPackage = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: DataStore
): DcsJs.CampaignPackage | undefined => {
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	if (dataStore?.airdromes == null) {
		return;
	}

	const usableAircrafts = getUsableAircraftsByType(faction.inventory.aircrafts, faction.aircraftTypes.cas);

	if (usableAircrafts == null || usableAircrafts.length === 0) {
		return;
	}

	const firstAircraft = firstItem(usableAircrafts);

	const selectedAircrafts = usableAircrafts.filter((ac) => ac.aircraftType === firstAircraft?.aircraftType);

	if (firstAircraft == null || selectedAircrafts == null || selectedAircrafts.length === 0) {
		return;
	}

	const isHelicopter = dataStore.aircrafts?.[firstAircraft.aircraftType]?.isHelicopter;

	const startPosition =
		firstAircraft.homeBase.type === "airdrome"
			? dataStore.airdromes[firstAircraft.homeBase.name as DcsJs.AirdromeName]
			: firstItem(dataStore.farps?.[firstAircraft.homeBase.name])?.position;

	if (startPosition == null) {
		return;
	}

	const groundGroupTarget = getCasTarget(startPosition, oppFaction);

	if (groundGroupTarget == null) {
		return;
	}

	const headingObjectiveToAirdrome = headingToPosition(groundGroupTarget.position, startPosition);
	const racetrackStart = positionFromHeading(groundGroupTarget.position, headingObjectiveToAirdrome - 90, 7500);
	const racetrackEnd = positionFromHeading(groundGroupTarget.position, headingObjectiveToAirdrome + 90, 7500);
	const durationEnRoute = getDurationEnRoute(startPosition, groundGroupTarget.position, speed);
	const casDuration = Minutes(30);

	const startTime = Math.floor(state.timer) + Minutes(random(20, 35));
	const endEnRouteTime = startTime + durationEnRoute;
	const endCASTime = endEnRouteTime + 1 + casDuration;
	const [, landingWaypoints, landingTime] = calcLandingWaypoints(
		groundGroupTarget.position,
		startPosition,
		endEnRouteTime + 1
	);

	const cs = generateCallSign(state, dataStore, isHelicopter ? "helicopter" : "aircraft");

	const flightGroup: DcsJs.CampaignFlightGroup = {
		id: createUniqueId(),
		airdromeName: firstAircraft.homeBase.name as DcsJs.AirdromeName,
		units:
			usableAircrafts?.slice(0, 2).map((aircraft, i) => ({
				id: aircraft.id,
				callSign: `${cs.unit}${i + 1}`,
				name: `${cs.flightGroup}-${i + 1}`,
				client: false,
			})) ?? [],
		name: cs.flightGroup,
		task: "CAS",
		startTime,
		tot: endEnRouteTime + 1,
		landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(startPosition),
				endPosition: racetrackStart,
				time: startTime,
				endTime: endEnRouteTime,
				speed,
				onGround: true,
			},
			{
				name: "Track-race start",
				position: racetrackStart,
				endPosition: objectToPosition(startPosition),
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
			...landingWaypoints,
		],
		objective: groundGroupTarget.objective,
		position: objectToPosition(startPosition),
	};

	const flightGroups = [flightGroup];

	return {
		task: "CAS" as DcsJs.Task,
		startTime,
		endTime: calcPackageEndTime(flightGroups),
		flightGroups,
		id: createUniqueId(),
	};
};
