import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createUniqueId } from "solid-js";

import * as Domain from "../../domain";
import {
	addHeading,
	calcPackageEndTime,
	getDurationEnRoute,
	jtacFrequency,
	objectToPosition,
	positionFromHeading,
} from "../../utils";
import { getCasTarget } from "../targetSelection";
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

export const generateCasPackage = (
	coalition: DcsJs.Coalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
): DcsJs.FlightPackage | undefined => {
	const faction = getCoalitionFaction(coalition, state);

	if (dataStore?.airdromes == null) {
		return;
	}

	const packageAircrafts = getPackageAircrafts({
		aircraftTypes: faction.aircraftTypes["CAS"],
		task: "CAS",
		coalition,
		state,
		count: 2,
		dataStore,
		faction,
	});

	if (packageAircrafts?.startPosition == null) {
		// eslint-disable-next-line no-console
		console.warn("generateCasPackage: start position not found", { packageAircrafts });
		return;
	}

	const cruiseSpeed = getCruiseSpeed(packageAircrafts.aircrafts, dataStore);

	const aircraftType = Domain.Utils.firstItem(packageAircrafts.aircrafts)?.aircraftType as DcsJs.AircraftType;
	const isHelicopter = dataStore.aircrafts?.[aircraftType]?.isHelicopter;

	const groundGroupTarget = getCasTarget(packageAircrafts.startPosition, coalition, state);

	if (groundGroupTarget == null) {
		return;
	}

	/* const headingObjectiveToAirdrome = Utils.headingToPosition(
		groundGroupTarget.position,
		packageAircrafts.startPosition,
	); */
	// const racetrackStart = positionFromHeading(groundGroupTarget.position, headingObjectiveToAirdrome - 90, 7500);
	// const racetrackEnd = positionFromHeading(groundGroupTarget.position, headingObjectiveToAirdrome + 90, 7500);
	const ingressPosition = positionFromHeading(
		groundGroupTarget.position,
		Utils.Location.headingToPosition(groundGroupTarget.position, packageAircrafts.startPosition),
		15000,
	);

	const [holdWaypoint, holdPosition, holdTime] = calcHoldWaypoint(
		packageAircrafts.startPosition,
		ingressPosition,
		cruiseSpeed,
	);

	const oppAirdrome = calcNearestOppositeAirdrome(coalition, state, dataStore, groundGroupTarget.position);
	const egressHeading =
		oppAirdrome == null
			? Utils.Location.headingToPosition(groundGroupTarget.position, packageAircrafts.startPosition)
			: Utils.Location.headingToPosition(groundGroupTarget.position, { x: oppAirdrome.x, y: oppAirdrome.y });
	const egressPosition = positionFromHeading(groundGroupTarget.position, addHeading(egressHeading, 180), 20000);

	const casDuration = Domain.Time.Minutes(30);

	const durationEnRoute = getDurationEnRoute(holdPosition, ingressPosition, cruiseSpeed);
	const durationIngress = getDurationEnRoute(ingressPosition, groundGroupTarget.position, cruiseSpeed);
	const durationEngress = getDurationEnRoute(groundGroupTarget.position, egressPosition, cruiseSpeed);
	const endEnRouteTime = holdTime + durationEnRoute;
	const endIngressTime = endEnRouteTime + durationIngress;
	const endEgressTime = endIngressTime + casDuration + durationEngress;

	const activeCas = faction.packages.filter((pkg) => pkg.task === "CAS");
	const activeCasStartTime = activeCas.reduce((prev, pkg) => {
		if (pkg.startTime > prev) {
			return pkg.startTime;
		}

		return prev;
	}, 0);
	const nextAvailableStartTime = activeCasStartTime + Domain.Time.Minutes(Domain.Random.number(20, 30));
	const currentStartTime = Math.floor(state.timer) + Domain.Time.Minutes(Domain.Random.number(15, 20));
	const startTime = currentStartTime > nextAvailableStartTime ? currentStartTime : nextAvailableStartTime;

	const endOnStationTime = endEnRouteTime + 1 + casDuration;
	const [landingWaypoints, landingTime] = calcLandingWaypoints({
		egressPosition,
		airdromePosition: packageAircrafts.startPosition,
		prevWaypointTime: endEgressTime + 1,
		cruiseSpeed,
	});

	const cs = generateCallSign(state, dataStore, isHelicopter ? "helicopter" : "aircraft");

	const flightGroup: DcsJs.FlightGroup = {
		id: createUniqueId() + "-" + String(startTime),
		airdromeName: packageAircrafts.startPosition.name,
		units:
			packageAircrafts.aircrafts.slice(0, 2).map((aircraft, i) => ({
				id: aircraft.id,
				callSign: cs.unitCallSign(i),
				name: cs.unitName(i),
				client: false,
				loadout: getLoadoutForAircraftType(aircraft.aircraftType as DcsJs.AircraftType, "CAS", dataStore),
			})) ?? [],
		name: cs.flightGroupName,
		task: "CAS",
		startTime,
		designatedStartTime: startTime,
		tot: endEnRouteTime + 1,
		landingTime,
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
				name: `CAS ${groundGroupTarget.objectiveName}`,
				position: groundGroupTarget.position,
				speed: cruiseSpeed,
				duration: casDuration,
				time: endIngressTime + 1,
				taskStart: true,
				onGround: true,
				/* racetrack: {
					position: racetrackEnd,
					name: "Track-race end",
					distance: Utils.distanceToPosition(racetrackStart, racetrackEnd),
					duration: getDurationEnRoute(racetrackStart, racetrackEnd, cruiseSpeed),
				}, */
			},
			{
				name: "Egress",
				position: egressPosition,
				speed: cruiseSpeed,
				time: endEgressTime + 1,
			},
			...landingWaypoints,
		],
		jtacFrequency: jtacFrequency(faction),
		position: objectToPosition(packageAircrafts.startPosition),
		target: groundGroupTarget.id,
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	const flightGroups = [flightGroup];

	return {
		task: "CAS" as DcsJs.Task,
		startTime,
		taskEndTime: endOnStationTime,
		endTime: calcPackageEndTime(startTime, flightGroups),
		flightGroups,
		frequency: calcFrequency(aircraftType, faction, dataStore),
		id: createUniqueId(),
	};
};
