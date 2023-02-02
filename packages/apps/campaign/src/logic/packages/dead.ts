import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import {
	calcPackageEndTime,
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
import { getDeadTarget } from "../targetSelection";
import { RunningCampaignState } from "../types";
import { calcLandingWaypoints, generateCallSign, getCoalitionFaction } from "../utils";

export const generateDeadPackage = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: DataStore
): DcsJs.CampaignPackage | undefined => {
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	if (faction == null || dataStore.airdromes == null) {
		return;
	}

	const usableAircrafts = getUsableAircraftsByType(faction?.inventory.aircrafts, faction?.aircraftTypes.dead);

	if (usableAircrafts == null || usableAircrafts.length === 0) {
		return;
	}

	const airdromeName = firstItem(faction?.airdromeNames);

	if (airdromeName == null) {
		throw `airdrome not found: ${airdromeName ?? ""}`;
	}

	const airdrome = dataStore.airdromes[airdromeName];

	const selectedObjective = getDeadTarget(airdrome, oppFaction);

	if (selectedObjective == null) {
		return;
	}

	const speed = 170;
	const ingressPosition = positionFromHeading(
		selectedObjective.position,
		headingToPosition(selectedObjective.position, airdrome),
		100000
	);
	const durationEnRoute = getDurationEnRoute(airdrome, selectedObjective.position, speed);
	const durationIngress = getDurationEnRoute(ingressPosition, selectedObjective.position, speed);

	const startTime = Math.floor(state.timer) + Minutes(random(15, 25));
	const endEnRouteTime = startTime + durationEnRoute;
	const endIngressTime = endEnRouteTime + durationIngress;

	const [landingNavPosition, landingWaypoints, landingTime] = calcLandingWaypoints(
		selectedObjective.position,
		airdrome,
		endEnRouteTime + 1
	);

	const cs = generateCallSign(state, dataStore, "aircraft");

	const flightGroup: DcsJs.CampaignFlightGroup = {
		id: createUniqueId(),
		airdromeName,
		units:
			usableAircrafts?.slice(0, 2).map((aircraft, i) => ({
				id: aircraft.id,
				callSign: `${cs.unit}${i + 1}`,
				name: `${cs.flightGroup}-${i + 1}`,
				client: false,
			})) ?? [],
		name: cs.flightGroup,
		task: "DEAD",
		startTime,
		tot: endEnRouteTime + 1,
		landingTime: landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(airdrome),
				endPosition: ingressPosition,
				time: startTime,
				endTime: endEnRouteTime,
				speed,
				onGround: true,
			},
			{
				name: "Ingress",
				position: selectedObjective.position,
				endPosition: objectToPosition(airdrome),
				speed,
				time: endEnRouteTime + 1,
				endTime: endIngressTime,
				taskStart: true,
			},
			{
				name: "DEAD",
				position: selectedObjective.position,
				endPosition: landingNavPosition,
				time: endEnRouteTime + 1,
				endTime: endEnRouteTime + 1,
				speed,
			},
			...landingWaypoints,
		],
		objective: {
			name: selectedObjective.id,
			coalition: oppositeCoalition(coalition),
			position: selectedObjective.position,
			structures: [],
			deploymentReadyTimer: 0,
			incomingGroundGroups: {},
		},
		position: objectToPosition(airdrome),
	};

	const flightGroups = [flightGroup];

	return {
		task: "DEAD" as DcsJs.Task,
		startTime,
		endTime: calcPackageEndTime(flightGroups),
		flightGroups,
		id: createUniqueId(),
	};
};
