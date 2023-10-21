import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createUniqueId } from "solid-js";

import * as Domain from "../../domain";
import { addHeading, calcPackageEndTime, getDurationEnRoute, objectToPosition, positionFromHeading } from "../../utils";
import { getDeadTarget } from "../targetSelection";
import { RunningCampaignState } from "../types";
import {
	calcLandingWaypoints,
	calcNearestOppositeAirdrome,
	generateCallSign,
	getCoalitionFaction,
	getLoadoutForAircraftType,
} from "../utils";
import { escortFlightGroup } from "./escort";
import {
	calcFrequency,
	calcHoldWaypoint,
	getCruiseSpeed,
	getPackageAircrafts,
	updateAircraftForFlightGroup,
} from "./utils";

export const generateDeadPackage = (
	coalition: DcsJs.Coalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
): DcsJs.FlightPackage | undefined => {
	const faction = getCoalitionFaction(coalition, state);

	if (faction == null || dataStore.airdromes == null) {
		return;
	}

	const packageAircrafts = getPackageAircrafts({
		aircraftTypes: faction.aircraftTypes.DEAD,
		task: "DEAD",
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

	if (packageAircrafts?.startPosition == null) {
		// eslint-disable-next-line no-console
		console.warn("generateDeadPackage: start position not found", packageAircrafts);
		return;
	}

	const aircraftType = Domain.Utils.firstItem(packageAircrafts.aircrafts)?.aircraftType as DcsJs.AircraftType;

	const frequency = calcFrequency(packageAircrafts.aircrafts[0]?.aircraftType, faction, dataStore);

	const cruiseSpeed = getCruiseSpeed(
		[...packageAircrafts.aircrafts, ...(escortPackageAircrafts?.aircrafts ?? [])],
		dataStore,
	);

	const selectedObjective = getDeadTarget(packageAircrafts.startPosition, coalition, state);

	if (selectedObjective == null) {
		return;
	}

	const ingressPosition = positionFromHeading(
		selectedObjective.position,
		Utils.headingToPosition(selectedObjective.position, packageAircrafts.startPosition),
		selectedObjective.range * 1.2,
	);
	const oppAirdrome = calcNearestOppositeAirdrome(coalition, state, dataStore, selectedObjective.position);
	const engressHeading =
		oppAirdrome == null
			? Utils.headingToPosition(selectedObjective.position, packageAircrafts.startPosition)
			: Utils.headingToPosition(selectedObjective.position, { x: oppAirdrome.x, y: oppAirdrome.y });
	const egressPosition = positionFromHeading(
		selectedObjective.position,
		addHeading(engressHeading, 180),
		selectedObjective.range * 1.2,
	);

	const startTime = Math.floor(state.timer) + Domain.Time.Minutes(Domain.Random.number(5, 15));
	const [holdWaypoint, holdPosition, holdTime] = calcHoldWaypoint(
		packageAircrafts.startPosition,
		ingressPosition,
		cruiseSpeed,
	);

	const durationEnRoute = getDurationEnRoute(holdPosition, selectedObjective.position, cruiseSpeed);
	const durationIngress = getDurationEnRoute(ingressPosition, selectedObjective.position, cruiseSpeed);
	const durationEgress = getDurationEnRoute(selectedObjective.position, egressPosition, cruiseSpeed);

	const endEnRouteTime = holdTime + durationEnRoute;
	const endIngressTime = endEnRouteTime + durationIngress;
	const endEgressTime = endIngressTime + durationEgress;

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
			packageAircrafts.aircrafts?.slice(0, 2).map(
				(aircraft, i) =>
					({
						id: aircraft.id,
						callSign: cs.unitCallSign(i),
						name: cs.unitName(i),
						client: false,
						loadout: getLoadoutForAircraftType(aircraft.aircraftType as DcsJs.AircraftType, "DEAD", dataStore),
					}) as DcsJs.FlightGroupUnit,
			) ?? [],
		name: cs.flightGroupName,
		task: "DEAD",
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
				name: "DEAD",
				position: selectedObjective.position,
				time: endIngressTime + 1,
				onGround: true,
				speed: cruiseSpeed,
			},
			{
				name: "Egress",
				position: egressPosition,
				time: endEnRouteTime + 2,
				speed: cruiseSpeed,
			},
			...landingWaypoints,
		],
		target: selectedObjective.name,
		position: objectToPosition(packageAircrafts.startPosition),
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	let escort: DcsJs.FlightGroup | undefined = undefined;

	if (escortPackageAircrafts != null) {
		escort = escortFlightGroup({
			coalition,
			state,
			dataStore,
			targetFlightGroup: flightGroup,
			holdWaypoint,
			egressPosition,
			egressTime: endEgressTime,
			cruiseSpeed,
			packageAircrafts: escortPackageAircrafts,
			frequency,
		});
	}

	if (escort != null) {
		updateAircraftForFlightGroup(escort, state, coalition, dataStore);
	}

	const flightGroups = escort == null ? [flightGroup] : [flightGroup, escort];

	return {
		task: "DEAD" as DcsJs.Task,
		startTime,
		taskEndTime: endEnRouteTime + 1,
		endTime: calcPackageEndTime(startTime, flightGroups),
		flightGroups,
		frequency: calcFrequency(aircraftType, faction, dataStore),
		id: createUniqueId(),
	};
};
