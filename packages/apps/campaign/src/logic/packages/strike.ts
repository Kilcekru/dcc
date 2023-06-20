import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import { Position } from "../../types";
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
import { getStrikeTarget } from "../targetSelection";
import { RunningCampaignState } from "../types";
import { calcLandingWaypoints, calcNearestOppositeAirdrome, generateCallSign, getCoalitionFaction } from "../utils";
import { updateAircraftForFlightGroup } from "./utils";

const speed = 170;

const calcHoldWaypoint = (
	startPosition: Position,
	targetPosition: Position,
	startTime: number
): [DcsJs.CampaignWaypoint, Position, number] => {
	const targetHeading = headingToPosition(startPosition, targetPosition);

	const holdPosition = positionFromHeading(startPosition, targetHeading, 20_000);

	const durationEnRoute = getDurationEnRoute(startPosition, holdPosition, speed);
	const endTime = startTime + durationEnRoute;
	const holdEndTime = endTime + Minutes(2);

	const waypoint: DcsJs.CampaignWaypoint = {
		name: "Hold",
		position: holdPosition,
		time: startTime,
		speed,
		duration: Minutes(2),
		hold: true,
	};

	return [waypoint, holdPosition, holdEndTime];
};

const escortFlightGroup = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: DataStore,
	targetFlightGroup: DcsJs.CampaignFlightGroup,
	ingressPosition: Position,
	engressPosition: Position,
	engressTime: number
) => {
	const faction = getCoalitionFaction(coalition, state);

	if (faction == null || dataStore.airdromes == null) {
		return;
	}

	const usableAircrafts = getUsableAircraftsByType(state, coalition, faction?.aircraftTypes.CAP, 2);

	if (usableAircrafts == null || usableAircrafts.length === 0) {
		return;
	}

	const airdromeName = firstItem(faction.airdromeNames);

	if (airdromeName == null) {
		throw `airdrome not found: ${airdromeName ?? ""}`;
	}

	const airdrome = dataStore.airdromes[airdromeName];

	if (airdrome == null) {
		throw `escortFlightGroup: airdrome not found: ${airdromeName ?? ""}`;
	}

	let cs = generateCallSign(coalition, state, dataStore, "aircraft");

	while (cs.flightGroupName === targetFlightGroup.name) {
		cs = generateCallSign(coalition, state, dataStore, "aircraft");
	}

	const [holdWaypoint] = calcHoldWaypoint(airdrome, ingressPosition, targetFlightGroup.startTime);
	const [landingWaypoints] = calcLandingWaypoints(engressPosition, airdrome, engressTime);

	holdWaypoint.taskStart = true;

	const flightGroup: DcsJs.CampaignFlightGroup = {
		id: createUniqueId() + "-" + String(targetFlightGroup.startTime),
		airdromeName,
		units:
			usableAircrafts?.slice(0, 2).map((aircraft, i) => ({
				id: aircraft.id,
				callSign: cs.unitCallSign(i),
				name: cs.unitName(i),
				client: false,
			})) ?? [],
		name: cs.flightGroupName,
		task: "Escort",
		startTime: targetFlightGroup.startTime,
		tot: targetFlightGroup.tot,
		landingTime: targetFlightGroup.landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(airdrome),
				time: targetFlightGroup.startTime,
				speed,
				onGround: true,
			},
			holdWaypoint,
			...landingWaypoints,
		],
		target: targetFlightGroup.name,
		position: objectToPosition(airdrome),
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	return flightGroup;
};
export const generateStrikePackage = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: DataStore
): DcsJs.CampaignPackage | undefined => {
	// console.log("generate strike");
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	if (faction == null || dataStore.airdromes == null) {
		return;
	}

	const usableAircrafts = getUsableAircraftsByType(state, coalition, faction?.aircraftTypes["Pinpoint Strike"], 2);
	// console.log("usable aircrafts", usableAircrafts);

	if (usableAircrafts == null || usableAircrafts.length === 0) {
		return;
	}

	const airdromeName = firstItem(faction?.airdromeNames);

	if (airdromeName == null) {
		throw `airdrome not found: ${airdromeName ?? ""}`;
	}

	const airdrome = dataStore.airdromes[airdromeName];

	if (airdrome == null) {
		throw `generateStrikePackage: airdrome not found: ${airdromeName ?? ""}`;
	}

	const targetStructure = getStrikeTarget(airdrome, state.objectives, coalition, faction, oppFaction);

	if (targetStructure == null) {
		return;
	}

	const activeStrikes = faction.packages.filter((pkg) => pkg.task === "Pinpoint Strike");
	const activeStrikeStartTime = activeStrikes.reduce((prev, pkg) => {
		if (pkg.startTime > prev) {
			return pkg.startTime;
		}

		return prev;
	}, 0);
	const nextAvailableStartTime = activeStrikeStartTime + Minutes(random(20, 30));
	const currentStartTime = Math.floor(state.timer) + Minutes(random(15, 20));
	const startTime = currentStartTime > nextAvailableStartTime ? currentStartTime : nextAvailableStartTime;

	const ingressPosition = positionFromHeading(
		targetStructure.position,
		headingToPosition(targetStructure.position, airdrome),
		15000
	);

	const oppAirdrome = calcNearestOppositeAirdrome(coalition, state, dataStore, targetStructure.position);
	const engressHeading =
		oppAirdrome == null
			? headingToPosition(targetStructure.position, airdrome)
			: headingToPosition(targetStructure.position, { x: oppAirdrome.x, y: oppAirdrome.y });
	const engressPosition = positionFromHeading(targetStructure.position, addHeading(engressHeading, 180), 20000);

	const durationIngress = getDurationEnRoute(ingressPosition, targetStructure.position, speed);
	const durationEngress = getDurationEnRoute(targetStructure.position, engressPosition, speed);

	const [holdWaypoint, holdPosition, holdTime] = calcHoldWaypoint(airdrome, ingressPosition, startTime);
	const durationEnRoute = getDurationEnRoute(holdPosition, ingressPosition, speed);
	const endEnRouteTime = holdTime + durationEnRoute;
	const totTime = endEnRouteTime + 1;
	const endIngressTime = endEnRouteTime + durationIngress;
	const endEngressTime = endIngressTime + durationEngress;
	const [landingWaypoints, landingTime] = calcLandingWaypoints(engressPosition, airdrome, endEngressTime + 1);

	const cs = generateCallSign(coalition, state, dataStore, "aircraft");

	const flightGroup: DcsJs.CampaignFlightGroup = {
		id: createUniqueId() + "-" + String(startTime),
		airdromeName,
		units:
			usableAircrafts?.slice(0, 2).map((aircraft, i) => ({
				id: aircraft.id,
				callSign: cs.unitCallSign(i),
				name: cs.unitName(i),
				client: false,
			})) ?? [],
		name: cs.flightGroupName,
		task: "Pinpoint Strike",
		startTime,
		tot: totTime,
		landingTime: landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(airdrome),
				time: startTime,
				speed,
				onGround: true,
			},
			holdWaypoint,
			{
				name: "Ingress",
				position: ingressPosition,
				speed,
				time: endEnRouteTime + 1,
				taskStart: true,
			},
			{
				name: `Strike ${targetStructure.objectiveName}`,
				position: {
					x: targetStructure.position.x,
					y: targetStructure.position.y,
				},
				speed,
				time: endIngressTime + 1,
				onGround: true,
			},
			{
				name: "Engress",
				position: engressPosition,
				speed,
				time: endIngressTime + 2,
			},
			...landingWaypoints,
		],
		target: targetStructure.name,
		position: objectToPosition(airdrome),
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	const escort = escortFlightGroup(
		coalition,
		state,
		dataStore,
		flightGroup,
		ingressPosition,
		engressPosition,
		endEngressTime
	);

	if (escort != null) {
		updateAircraftForFlightGroup(escort, state, coalition, dataStore);
	}

	const flightGroups = escort == null ? [flightGroup] : [flightGroup, escort];

	return {
		task: "Pinpoint Strike" as DcsJs.Task,
		startTime,
		taskEndTime: endIngressTime + 1,
		endTime: calcPackageEndTime(flightGroups),
		flightGroups,
		frequency: random(310, 343),
		id: createUniqueId(),
	};
};
