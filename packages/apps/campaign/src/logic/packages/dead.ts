import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import {
	addHeading,
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
import { calcLandingWaypoints, calcNearestOppositeAirdrome, generateCallSign, getCoalitionFaction } from "../utils";
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
	const usableAircrafts = getUsableAircraftsByType(state, coalition, faction?.aircraftTypes.DEAD, 2);

	if (usableAircrafts == null || usableAircrafts.length === 0) {
		return;
	}

	const airdromeName = firstItem(faction?.airdromeNames);

	if (airdromeName == null) {
		throw `airdrome not found: ${airdromeName ?? ""}`;
	}

	const airdrome = dataStore.airdromes[airdromeName];

	if (airdrome == null) {
		throw `generateDeadPackage: airdrome not found: ${airdromeName ?? ""}`;
	}

	const selectedObjective = getDeadTarget(airdrome, oppFaction);

	if (selectedObjective == null) {
		return;
	}

	const speed = 170;
	const ingressPosition = positionFromHeading(
		selectedObjective.position,
		headingToPosition(selectedObjective.position, airdrome),
		selectedObjective.range
	);
	const oppAirdrome = calcNearestOppositeAirdrome(coalition, state, dataStore, selectedObjective.position);
	const engressHeading =
		oppAirdrome == null
			? headingToPosition(selectedObjective.position, airdrome)
			: headingToPosition(selectedObjective.position, { x: oppAirdrome.x, y: oppAirdrome.y });
	const engressPosition = positionFromHeading(
		selectedObjective.position,
		addHeading(engressHeading, 180),
		selectedObjective.range
	);

	const durationEnRoute = getDurationEnRoute(airdrome, selectedObjective.position, speed);
	const durationIngress = getDurationEnRoute(ingressPosition, selectedObjective.position, speed);
	const durationEngress = getDurationEnRoute(selectedObjective.position, engressPosition, speed);

	const startTime = Math.floor(state.timer) + Minutes(random(5, 15));
	const endEnRouteTime = startTime + durationEnRoute;
	const endIngressTime = endEnRouteTime + durationIngress;
	const endEngressTime = endIngressTime + durationEngress;

	const [landingWaypoints, landingTime] = calcLandingWaypoints(engressPosition, airdrome, endEngressTime + 1);

	const cs = generateCallSign(coalition, state, dataStore, "aircraft");

	const flightGroup: DcsJs.CampaignFlightGroup = {
		id: createUniqueId() + "-" + String(startTime),
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
				position: ingressPosition,
				speed,
				time: endEnRouteTime + 1,
				taskStart: true,
			},
			{
				name: "DEAD",
				position: selectedObjective.position,
				time: endEnRouteTime + 1,
				onGround: true,
				speed,
			},
			{
				name: "Engress",
				position: engressPosition,
				time: endEnRouteTime + 2,
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
		target: selectedObjective.id,
		position: objectToPosition(airdrome),
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

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
