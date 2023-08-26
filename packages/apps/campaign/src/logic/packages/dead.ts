import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createUniqueId } from "solid-js";

import * as Domain from "../../domain";
import {
	addHeading,
	calcPackageEndTime,
	getDurationEnRoute,
	Minutes,
	objectToPosition,
	oppositeCoalition,
	positionFromHeading,
	random,
} from "../../utils";
import { getDeadTarget } from "../targetSelection";
import { RunningCampaignState } from "../types";
import {
	calcLandingWaypoints,
	calcNearestOppositeAirdrome,
	generateCallSign,
	getCoalitionFaction,
	getLoadoutForAircraftType,
} from "../utils";
import {
	calcFrequency,
	calcHoldWaypoint,
	getCruiseSpeed,
	getPackageAircrafts,
	updateAircraftForFlightGroup,
} from "./utils";

export const generateDeadPackage = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
): DcsJs.CampaignPackage | undefined => {
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	if (faction == null || dataStore.airdromes == null) {
		return;
	}

	const packageAircrafts = getPackageAircrafts({
		aircraftTypes: faction.aircraftTypes.DEAD,
		coalition,
		state,
		count: 2,
		dataStore,
		faction,
	});

	if (packageAircrafts?.startPosition == null) {
		// eslint-disable-next-line no-console
		console.warn("generateDeadPackage: start position not found", packageAircrafts);
		return;
	}

	const aircraftType = Domain.Utils.firstItem(packageAircrafts.aircrafts)?.aircraftType as DcsJs.AircraftType;

	const cruiseSpeed = getCruiseSpeed(packageAircrafts.aircrafts, dataStore);

	const selectedObjective = getDeadTarget(packageAircrafts.startPosition, oppFaction);

	if (selectedObjective == null) {
		return;
	}

	const ingressPosition = positionFromHeading(
		selectedObjective.position,
		Utils.headingToPosition(selectedObjective.position, packageAircrafts.startPosition),
		selectedObjective.range,
	);
	const oppAirdrome = calcNearestOppositeAirdrome(coalition, state, dataStore, selectedObjective.position);
	const engressHeading =
		oppAirdrome == null
			? Utils.headingToPosition(selectedObjective.position, packageAircrafts.startPosition)
			: Utils.headingToPosition(selectedObjective.position, { x: oppAirdrome.x, y: oppAirdrome.y });
	const egressPosition = positionFromHeading(
		selectedObjective.position,
		addHeading(engressHeading, 180),
		selectedObjective.range,
	);

	const startTime = Math.floor(state.timer) + Minutes(random(5, 15));
	const [holdWaypoint, holdPosition, holdTime] = calcHoldWaypoint(
		packageAircrafts.startPosition,
		ingressPosition,
		cruiseSpeed,
	);

	const durationEnRoute = getDurationEnRoute(holdPosition, selectedObjective.position, cruiseSpeed);
	const durationIngress = getDurationEnRoute(ingressPosition, selectedObjective.position, cruiseSpeed);
	const durationEngress = getDurationEnRoute(selectedObjective.position, egressPosition, cruiseSpeed);

	const endEnRouteTime = holdTime + durationEnRoute;
	const endIngressTime = endEnRouteTime + durationIngress;
	const endEngressTime = endIngressTime + durationEngress;

	const [landingWaypoints, landingTime] = calcLandingWaypoints({
		egressPosition: egressPosition,
		airdromePosition: packageAircrafts.startPosition,
		prevWaypointTime: endEngressTime + 1,
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
					}) as DcsJs.CampaignFlightGroupUnit,
			) ?? [],
		name: cs.flightGroupName,
		task: "DEAD",
		startTime,
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
		target: selectedObjective.id,
		position: objectToPosition(packageAircrafts.startPosition),
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	const flightGroups = [flightGroup];

	return {
		task: "DEAD" as DcsJs.Task,
		startTime,
		taskEndTime: endEnRouteTime + 1,
		endTime: calcPackageEndTime(startTime, flightGroups),
		flightGroups,
		frequency: calcFrequency(aircraftType, dataStore),
		id: createUniqueId(),
	};
};
