import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import {
	addHeading,
	calcPackageEndTime,
	getDurationEnRoute,
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
import { calcFrequency, getCruiseSpeed, getPackageAircrafts, updateAircraftForFlightGroup } from "./utils";

const calcHoldWaypoint = (
	startPosition: DcsJs.Position,
	targetPosition: DcsJs.Position,
	startTime: number,
	speed: number,
): [DcsJs.CampaignWaypoint, DcsJs.Position, number] => {
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
	dataStore: Types.Campaign.DataStore,
	targetFlightGroup: DcsJs.FlightGroup,
	ingressPosition: DcsJs.Position,
	engressPosition: DcsJs.Position,
	engressTime: number,
	cruiseSpeed: number,
	packageAircrafts: ReturnType<typeof getPackageAircrafts>,
) => {
	const faction = getCoalitionFaction(coalition, state);

	if (faction == null || dataStore.airdromes == null) {
		return;
	}

	if (packageAircrafts?.startPosition == null) {
		throw new Error("escortFlightGroup: start position not found");
	}

	let cs = generateCallSign(coalition, state, dataStore, "aircraft");

	while (cs.flightGroupName === targetFlightGroup.name) {
		cs = generateCallSign(coalition, state, dataStore, "aircraft");
	}

	const [holdWaypoint] = calcHoldWaypoint(
		packageAircrafts.startPosition,
		ingressPosition,
		targetFlightGroup.startTime,
		cruiseSpeed,
	);
	const [landingWaypoints] = calcLandingWaypoints(
		engressPosition,
		packageAircrafts.startPosition,
		engressTime,
		cruiseSpeed,
	);

	holdWaypoint.taskStart = true;

	const flightGroup: DcsJs.FlightGroup = {
		id: createUniqueId() + "-" + String(targetFlightGroup.startTime),
		airdromeName: packageAircrafts.startPosition.name,
		units:
			packageAircrafts.aircrafts.slice(0, 2).map((aircraft, i) => ({
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
				position: objectToPosition(packageAircrafts.startPosition),
				time: targetFlightGroup.startTime,
				speed: cruiseSpeed,
				onGround: true,
			},
			holdWaypoint,
			...landingWaypoints,
		],
		target: targetFlightGroup.name,
		position: objectToPosition(packageAircrafts.startPosition),
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	return flightGroup;
};

export const generateStrikePackage = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
): DcsJs.CampaignPackage | undefined => {
	// console.log("generate strike");
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	if (faction == null || dataStore.airdromes == null) {
		return;
	}

	const packageAircrafts = getPackageAircrafts({
		aircraftTypes: faction.aircraftTypes["Pinpoint Strike"],
		coalition,
		state,
		count: 2,
		dataStore,
		faction,
	});

	const escortPackageAircrafts = getPackageAircrafts({
		aircraftTypes: faction.aircraftTypes.CAP,
		coalition,
		state,
		count: 2,
		dataStore,
		faction,
	});

	if (packageAircrafts?.startPosition == null || escortPackageAircrafts?.startPosition == null) {
		throw new Error("generateStrikePackage: start position not found");
	}

	const cruiseSpeed = getCruiseSpeed([...packageAircrafts.aircrafts, ...escortPackageAircrafts.aircrafts], dataStore);

	const targetStructure = getStrikeTarget(
		packageAircrafts.startPosition,
		state.objectives,
		coalition,
		faction,
		oppFaction,
	);

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
		headingToPosition(targetStructure.position, packageAircrafts.startPosition),
		15000,
	);

	const oppAirdrome = calcNearestOppositeAirdrome(coalition, state, dataStore, targetStructure.position);
	const engressHeading =
		oppAirdrome == null
			? headingToPosition(targetStructure.position, packageAircrafts.startPosition)
			: headingToPosition(targetStructure.position, { x: oppAirdrome.x, y: oppAirdrome.y });
	const engressPosition = positionFromHeading(targetStructure.position, addHeading(engressHeading, 180), 20000);

	const durationIngress = getDurationEnRoute(ingressPosition, targetStructure.position, cruiseSpeed);
	const durationEngress = getDurationEnRoute(targetStructure.position, engressPosition, cruiseSpeed);

	const [holdWaypoint, holdPosition, holdTime] = calcHoldWaypoint(
		packageAircrafts.startPosition,
		ingressPosition,
		startTime,
		cruiseSpeed,
	);
	const durationEnRoute = getDurationEnRoute(holdPosition, ingressPosition, cruiseSpeed);
	const endEnRouteTime = holdTime + durationEnRoute;
	const totTime = endEnRouteTime + 1;
	const endIngressTime = endEnRouteTime + durationIngress;
	const endEngressTime = endIngressTime + durationEngress;
	const [landingWaypoints, landingTime] = calcLandingWaypoints(
		engressPosition,
		packageAircrafts.startPosition,
		endEngressTime + 1,
		cruiseSpeed,
	);

	const cs = generateCallSign(coalition, state, dataStore, "aircraft");

	const flightGroup: DcsJs.FlightGroup = {
		id: createUniqueId() + "-" + String(startTime),
		airdromeName: packageAircrafts.startPosition.name,
		units:
			packageAircrafts.aircrafts?.slice(0, 2).map((aircraft, i) => ({
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
				position: objectToPosition(packageAircrafts.startPosition),
				time: startTime,
				speed: cruiseSpeed,
				onGround: true,
			},
			holdWaypoint,
			{
				name: "Ingress",
				position: ingressPosition,
				speed: cruiseSpeed,
				time: endEnRouteTime + 1,
				taskStart: true,
			},
			{
				name: `Strike ${targetStructure.objectiveName}`,
				position: {
					x: targetStructure.position.x,
					y: targetStructure.position.y,
				},
				speed: cruiseSpeed,
				time: endIngressTime + 1,
				onGround: true,
			},
			{
				name: "Engress",
				position: engressPosition,
				speed: cruiseSpeed,
				time: endIngressTime + 2,
			},
			...landingWaypoints,
		],
		target: targetStructure.name,
		position: objectToPosition(packageAircrafts.startPosition),
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	const escort = escortFlightGroup(
		coalition,
		state,
		dataStore,
		flightGroup,
		ingressPosition,
		engressPosition,
		endEngressTime,
		cruiseSpeed,
		escortPackageAircrafts,
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
		frequency: calcFrequency(packageAircrafts.aircrafts[0]?.aircraftType, dataStore),
		id: createUniqueId(),
	};
};
