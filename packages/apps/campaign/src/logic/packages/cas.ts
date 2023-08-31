import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createUniqueId } from "solid-js";

import * as Domain from "../../domain";
import {
	calcPackageEndTime,
	getDurationEnRoute,
	Minutes,
	objectToPosition,
	oppositeCoalition,
	positionFromHeading,
	random,
} from "../../utils";
import { getCasTarget } from "../targetSelection";
import { RunningCampaignState } from "../types";
import { calcLandingWaypoints, generateCallSign, getCoalitionFaction, getLoadoutForAircraftType } from "../utils";
import { calcFrequency, getCruiseSpeed, getPackageAircrafts, updateAircraftForFlightGroup } from "./utils";

export const generateCasPackage = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
): DcsJs.CampaignPackage | undefined => {
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	if (dataStore?.airdromes == null) {
		return;
	}

	const packageAircrafts = getPackageAircrafts({
		aircraftTypes: faction.aircraftTypes["CAS"],
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

	const groundGroupTarget = getCasTarget(packageAircrafts.startPosition, oppFaction);

	if (groundGroupTarget == null) {
		return;
	}

	const headingObjectiveToAirdrome = Utils.headingToPosition(
		groundGroupTarget.position,
		packageAircrafts.startPosition,
	);
	const racetrackStart = positionFromHeading(groundGroupTarget.position, headingObjectiveToAirdrome - 90, 7500);
	const racetrackEnd = positionFromHeading(groundGroupTarget.position, headingObjectiveToAirdrome + 90, 7500);
	const durationEnRoute = getDurationEnRoute(packageAircrafts.startPosition, racetrackStart, cruiseSpeed);
	const casDuration = Minutes(30);

	const activeCas = faction.packages.filter((pkg) => pkg.task === "CAS");
	const activeCasStartTime = activeCas.reduce((prev, pkg) => {
		if (pkg.startTime > prev) {
			return pkg.startTime;
		}

		return prev;
	}, 0);
	const nextAvailableStartTime = activeCasStartTime + Minutes(random(20, 30));
	const currentStartTime = Math.floor(state.timer) + Minutes(random(15, 20));
	const startTime = currentStartTime > nextAvailableStartTime ? currentStartTime : nextAvailableStartTime;

	const endEnRouteTime = durationEnRoute;
	const endOnStationTime = endEnRouteTime + 1 + casDuration;
	const [landingWaypoints, landingTime] = calcLandingWaypoints({
		egressPosition: racetrackEnd,
		airdromePosition: packageAircrafts.startPosition,
		prevWaypointTime: endOnStationTime + 1,
		cruiseSpeed,
	});

	const cs = generateCallSign(coalition, state, dataStore, isHelicopter ? "helicopter" : "aircraft");

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
				speed: cruiseSpeed / 2,
				onGround: true,
			},
			{
				name: "Track-race start",
				position: racetrackStart,
				speed: cruiseSpeed / 2,
				duration: casDuration,
				time: endEnRouteTime + 1,
				taskStart: true,
				racetrack: {
					position: racetrackEnd,
					name: "Track-race end",
					distance: Utils.distanceToPosition(racetrackStart, racetrackEnd),
					duration: getDurationEnRoute(racetrackStart, racetrackEnd, cruiseSpeed),
				},
			},
			...landingWaypoints,
		],
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
		frequency: calcFrequency(aircraftType, dataStore),
		id: createUniqueId(),
	};
};
