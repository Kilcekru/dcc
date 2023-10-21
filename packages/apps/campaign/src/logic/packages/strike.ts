import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createUniqueId } from "solid-js";

import * as Domain from "../../domain";
import {
	addHeading,
	calcPackageEndTime,
	getDurationEnRoute,
	objectToPosition,
	oppositeCoalition,
	positionFromHeading,
} from "../../utils";
import { getStrikeTarget } from "../targetSelection";
import { RunningCampaignState } from "../types";
import { calcLandingWaypoints, calcNearestOppositeAirdrome, generateCallSign, getCoalitionFaction } from "../utils";
import { escortFlightGroup } from "./escort";
import {
	calcFrequency,
	calcHoldWaypoint,
	getCruiseSpeed,
	getPackageAircrafts,
	updateAircraftForFlightGroup,
} from "./utils";

export const generateStrikePackage = (
	coalition: DcsJs.Coalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
): DcsJs.FlightPackage | undefined => {
	// console.log("generate strike");
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	if (faction == null || dataStore.airdromes == null) {
		return;
	}

	const packageAircrafts = getPackageAircrafts({
		aircraftTypes: faction.aircraftTypes["Pinpoint Strike"],
		task: "Pinpoint Strike",
		coalition,
		state,
		count: 2,
		dataStore,
		faction,
	});

	const escortPackageAircrafts = getPackageAircrafts({
		aircraftTypes: faction.aircraftTypes.CAP,
		task: "CAP",
		coalition,
		state,
		count: 2,
		dataStore,
		faction,
		excludedAircrafts: packageAircrafts?.aircrafts,
	});

	if (packageAircrafts?.startPosition == null || escortPackageAircrafts?.startPosition == null) {
		// eslint-disable-next-line no-console
		console.warn("generateStrikePackage: start position not found", { packageAircrafts, escortPackageAircrafts });
		return;
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

	const frequency = calcFrequency(packageAircrafts.aircrafts[0]?.aircraftType, faction, dataStore);

	const activeStrikes = faction.packages.filter((pkg) => pkg.task === "Pinpoint Strike");
	const activeStrikeStartTime = activeStrikes.reduce((prev, pkg) => {
		if (pkg.startTime > prev) {
			return pkg.startTime;
		}

		return prev;
	}, 0);
	const nextAvailableStartTime = activeStrikeStartTime + Domain.Time.Minutes(Domain.Random.number(20, 30));
	const currentStartTime = Math.floor(state.timer) + Domain.Time.Minutes(Domain.Random.number(15, 20));
	const startTime = currentStartTime > nextAvailableStartTime ? currentStartTime : nextAvailableStartTime;

	const ingressPosition = positionFromHeading(
		targetStructure.position,
		Utils.headingToPosition(targetStructure.position, packageAircrafts.startPosition),
		15000,
	);

	const oppAirdrome = calcNearestOppositeAirdrome(coalition, state, dataStore, targetStructure.position);
	const egressHeading =
		oppAirdrome == null
			? Utils.headingToPosition(targetStructure.position, packageAircrafts.startPosition)
			: Utils.headingToPosition(targetStructure.position, { x: oppAirdrome.x, y: oppAirdrome.y });
	const egressPosition = positionFromHeading(targetStructure.position, addHeading(egressHeading, 180), 20000);

	const durationIngress = getDurationEnRoute(ingressPosition, targetStructure.position, cruiseSpeed);
	const durationEgress = getDurationEnRoute(targetStructure.position, egressPosition, cruiseSpeed);

	const [holdWaypoint, holdPosition, holdTime] = calcHoldWaypoint(
		packageAircrafts.startPosition,
		ingressPosition,
		cruiseSpeed,
	);
	const strikeDuration = Domain.Time.Minutes(5);
	const durationEnRoute = getDurationEnRoute(holdPosition, ingressPosition, cruiseSpeed);
	const endEnRouteTime = holdTime + durationEnRoute;
	const endIngressTime = endEnRouteTime + durationIngress;
	const endEgressTime = endIngressTime + strikeDuration + durationEgress;
	const [landingWaypoints, landingTime] = calcLandingWaypoints({
		egressPosition: egressPosition,
		airdromePosition: packageAircrafts.startPosition,
		prevWaypointTime: endEgressTime + 1,
		cruiseSpeed,
	});

	const cs = generateCallSign(state, dataStore, "aircraft");

	const flightGroup: DcsJs.FlightGroup = {
		id: createUniqueId() + "-" + String(startTime),
		airdromeName: packageAircrafts.startPosition.name,
		units:
			packageAircrafts.aircrafts?.map((aircraft, i) => ({
				id: aircraft.id,
				callSign: cs.unitCallSign(i),
				name: cs.unitName(i),
				client: false,
			})) ?? [],
		name: cs.flightGroupName,
		task: "Pinpoint Strike",
		startTime,
		designatedStartTime: startTime,
		tot: endIngressTime + 1,
		landingTime: landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(packageAircrafts.startPosition),
				time: 0,
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
				duration: strikeDuration,
				time: endIngressTime + 1,
				onGround: true,
			},
			{
				name: "Egress",
				position: egressPosition,
				speed: cruiseSpeed,
				time: endEgressTime + 1,
			},
			...landingWaypoints,
		],
		target: targetStructure.name,
		frequency,
		position: objectToPosition(packageAircrafts.startPosition),
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	const escort = escortFlightGroup({
		coalition,
		state,
		dataStore,
		targetFlightGroup: flightGroup,
		holdWaypoint: structuredClone(holdWaypoint),
		egressPosition,
		egressTime: endEgressTime,
		cruiseSpeed,
		packageAircrafts: escortPackageAircrafts,
		frequency,
	});

	if (escort != null) {
		updateAircraftForFlightGroup(escort, state, coalition, dataStore);
	}

	const flightGroups = escort == null ? [flightGroup] : [flightGroup, escort];

	return {
		task: "Pinpoint Strike" as DcsJs.Task,
		startTime,
		taskEndTime: endIngressTime + 1,
		endTime: calcPackageEndTime(startTime, flightGroups),
		flightGroups,
		frequency,
		id: createUniqueId(),
	};
};
