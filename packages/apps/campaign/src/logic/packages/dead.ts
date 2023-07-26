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
import { getDeadTarget } from "../targetSelection";
import { RunningCampaignState } from "../types";
import { calcLandingWaypoints, calcNearestOppositeAirdrome, generateCallSign, getCoalitionFaction } from "../utils";
import { calcFrequency, getCruiseSpeed, getPackageAircrafts, updateAircraftForFlightGroup } from "./utils";

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
		throw new Error("escortFlightGroup: start position not found");
	}

	const cruiseSpeed = getCruiseSpeed(packageAircrafts.aircrafts, dataStore);

	const selectedObjective = getDeadTarget(packageAircrafts.startPosition, oppFaction);

	if (selectedObjective == null) {
		return;
	}

	const ingressPosition = positionFromHeading(
		selectedObjective.position,
		headingToPosition(selectedObjective.position, packageAircrafts.startPosition),
		selectedObjective.range,
	);
	const oppAirdrome = calcNearestOppositeAirdrome(coalition, state, dataStore, selectedObjective.position);
	const engressHeading =
		oppAirdrome == null
			? headingToPosition(selectedObjective.position, packageAircrafts.startPosition)
			: headingToPosition(selectedObjective.position, { x: oppAirdrome.x, y: oppAirdrome.y });
	const engressPosition = positionFromHeading(
		selectedObjective.position,
		addHeading(engressHeading, 180),
		selectedObjective.range,
	);

	const durationEnRoute = getDurationEnRoute(packageAircrafts.startPosition, selectedObjective.position, cruiseSpeed);
	const durationIngress = getDurationEnRoute(ingressPosition, selectedObjective.position, cruiseSpeed);
	const durationEngress = getDurationEnRoute(selectedObjective.position, engressPosition, cruiseSpeed);

	const startTime = Math.floor(state.timer) + Minutes(random(5, 15));
	const endEnRouteTime = startTime + durationEnRoute;
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
			packageAircrafts.aircrafts?.slice(0, 2).map(
				(aircraft, i) =>
					({
						id: aircraft.id,
						callSign: cs.unitCallSign(i),
						name: cs.unitName(i),
						client: false,
					}) as DcsJs.CampaignFlightGroupUnit,
			) ?? [],
		name: cs.flightGroupName,
		task: "DEAD",
		startTime,
		tot: endEnRouteTime + 1,
		landingTime: landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(packageAircrafts.startPosition),
				time: startTime,
				speed: cruiseSpeed,
				onGround: true,
			},
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
				time: endEnRouteTime + 1,
				onGround: true,
				speed: cruiseSpeed,
			},
			{
				name: "Engress",
				position: engressPosition,
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
		endTime: calcPackageEndTime(flightGroups),
		flightGroups,
		frequency: calcFrequency(packageAircrafts.aircrafts[0]?.aircraftType, dataStore),
		id: createUniqueId(),
	};
};
