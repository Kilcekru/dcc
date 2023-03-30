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
import { updateAircraftForFlightGroup } from "./utils";

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

	const usableAircrafts = getUsableAircraftsByType(faction?.inventory.aircrafts, faction?.aircraftTypes.dead, 2);

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

	const startTime = Math.floor(state.timer) + Minutes(random(5, 15));
	const endEnRouteTime = startTime + durationEnRoute;
	const endIngressTime = endEnRouteTime + durationIngress;

	const [landingWaypoints, landingTime] = calcLandingWaypoints(
		selectedObjective.position,
		airdrome,
		endIngressTime + 1
	);

	const cs = generateCallSign(coalition, state, dataStore, "aircraft");

	const flightGroup: DcsJs.CampaignFlightGroup = {
		id: createUniqueId(),
		airdromeName,
		units:
			usableAircrafts?.slice(0, 2).map(
				(aircraft, i) =>
					({
						id: aircraft.id,
						callSign: cs.unitCallSign(i),
						name: cs.unitName(i),
						client: false,
					} as DcsJs.CampaignFlightGroupUnit)
			) ?? [],
		name: cs.flightGroupName,
		task: "DEAD",
		startTime,
		tot: endEnRouteTime + 1,
		landingTime: landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(airdrome),
				time: startTime,
				speed,
				onGround: true,
			},
			{
				name: "Ingress",
				position: selectedObjective.position,
				speed,
				time: endEnRouteTime + 1,
				taskStart: true,
			},
			{
				name: "DEAD",
				position: selectedObjective.position,
				time: endEnRouteTime + 1,
				speed,
			},
			...landingWaypoints,
		],
		objective: {
			name: selectedObjective.id,
			coalition: oppositeCoalition(coalition),
			position: selectedObjective.position,
			deploymentDelay: 0,
			deploymentTimer: 0,
			incomingGroundGroups: {},
		},
		position: objectToPosition(airdrome),
	};

	updateAircraftForFlightGroup(flightGroup, faction, dataStore);

	const flightGroups = [flightGroup];

	return {
		task: "DEAD" as DcsJs.Task,
		startTime,
		taskEndTime: endEnRouteTime + 1,
		endTime: calcPackageEndTime(flightGroups),
		flightGroups,
		frequency: random(310, 343),
		id: createUniqueId(),
	};
};
