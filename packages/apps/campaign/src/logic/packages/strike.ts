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
import {
	calcFrequency,
	calcHoldWaypoint,
	getCruiseSpeed,
	getPackageAircrafts,
	updateAircraftForFlightGroup,
} from "./utils";

const escortFlightGroup = ({
	coalition,
	state,
	dataStore,
	targetFlightGroup,
	ingressPosition,
	egressPosition,
	egressTime,
	cruiseSpeed,
	packageAircrafts,
}: {
	coalition: DcsJs.CampaignCoalition;
	state: RunningCampaignState;
	dataStore: Types.Campaign.DataStore;
	targetFlightGroup: DcsJs.FlightGroup;
	ingressPosition: DcsJs.Position;
	egressPosition: DcsJs.Position;
	egressTime: number;
	cruiseSpeed: number;
	packageAircrafts: ReturnType<typeof getPackageAircrafts>;
}) => {
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

	const aircraftType = Domain.Utils.firstItem(packageAircrafts.aircrafts)?.aircraftType as DcsJs.AircraftType;

	const [holdWaypoint] = calcHoldWaypoint(packageAircrafts.startPosition, ingressPosition, cruiseSpeed);
	const [landingWaypoints] = calcLandingWaypoints({
		egressPosition: egressPosition,
		airdromePosition: packageAircrafts.startPosition,
		prevWaypointTime: egressTime,
		cruiseSpeed,
	});

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
		designatedStartTime: targetFlightGroup.startTime,
		tot: targetFlightGroup.tot,
		landingTime: targetFlightGroup.landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(packageAircrafts.startPosition),
				time: 0,
				speed: cruiseSpeed,
				onGround: true,
			},
			holdWaypoint,
			...landingWaypoints,
		],
		target: targetFlightGroup.name,
		frequency: calcFrequency(aircraftType, dataStore),
		position: objectToPosition(packageAircrafts.startPosition),
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	return flightGroup;
};

export const generateStrikePackage = (
	coalition: DcsJs.CampaignCoalition,
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
		excludedAircrafts: packageAircrafts?.aircrafts,
	});

	if (packageAircrafts?.startPosition == null || escortPackageAircrafts?.startPosition == null) {
		// eslint-disable-next-line no-console
		console.warn("generateStrikePackage: start position not found", { packageAircrafts, escortPackageAircrafts });
		return;
	}

	const aircraftType = Domain.Utils.firstItem(packageAircrafts.aircrafts)?.aircraftType as DcsJs.AircraftType;
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
	const durationEngress = getDurationEnRoute(targetStructure.position, egressPosition, cruiseSpeed);

	const [holdWaypoint, holdPosition, holdTime] = calcHoldWaypoint(
		packageAircrafts.startPosition,
		ingressPosition,
		cruiseSpeed,
	);
	const strikeDuration = Domain.Time.Minutes(5);
	const durationEnRoute = getDurationEnRoute(holdPosition, ingressPosition, cruiseSpeed);
	const endEnRouteTime = holdTime + durationEnRoute;
	const endIngressTime = endEnRouteTime + durationIngress;
	const endEgressTime = endIngressTime + strikeDuration + durationEngress;
	const [landingWaypoints, landingTime] = calcLandingWaypoints({
		egressPosition: egressPosition,
		airdromePosition: packageAircrafts.startPosition,
		prevWaypointTime: endEgressTime + 1,
		cruiseSpeed,
	});

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
		frequency: calcFrequency(aircraftType, dataStore),
		position: objectToPosition(packageAircrafts.startPosition),
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	const escort = escortFlightGroup({
		coalition,
		state,
		dataStore,
		targetFlightGroup: flightGroup,
		ingressPosition,
		egressPosition,
		egressTime: endEgressTime,
		cruiseSpeed,
		packageAircrafts: escortPackageAircrafts,
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
		frequency: calcFrequency(packageAircrafts.aircrafts[0]?.aircraftType, dataStore),
		id: createUniqueId(),
	};
};
