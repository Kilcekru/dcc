import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import { Config } from "../../data";
import {
	calcPackageEndTime,
	distanceToPosition,
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
import { getCasTarget } from "../targetSelection";
import { RunningCampaignState } from "../types";
import { calcLandingWaypoints, generateCallSign, getCoalitionFaction, getLoadoutForAircraftType } from "../utils";
import { updateAircraftForFlightGroup } from "./utils";

export const generateCasPackage = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.DataStore
): DcsJs.CampaignPackage | undefined => {
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	if (dataStore?.airdromes == null) {
		return;
	}

	let usableAircrafts = getUsableAircraftsByType(state, coalition, faction.aircraftTypes.CAS, 2);

	if (usableAircrafts == null || usableAircrafts.length === 0) {
		return;
	}

	const firstAircraft = firstItem(usableAircrafts);

	const selectedAircrafts = usableAircrafts.filter((ac) => ac.aircraftType === firstAircraft?.aircraftType);

	if (firstAircraft == null || selectedAircrafts == null || selectedAircrafts.length < 2) {
		return;
	}

	let isHelicopter = dataStore.aircrafts?.[firstAircraft.aircraftType as DcsJs.AircraftType]?.isHelicopter;

	let startPosition =
		firstAircraft.homeBase.type === "airdrome"
			? dataStore.airdromes[firstAircraft.homeBase.name as DcsJs.AirdromeName]
			: faction.structures[firstAircraft.homeBase.name]?.position;

	if (startPosition == null) {
		// eslint-disable-next-line no-console
		console.warn("generateCasPackage: no startPosition found", firstAircraft.homeBase.name);
		return;
	}

	const groundGroupTarget = getCasTarget(startPosition, oppFaction);

	if (groundGroupTarget == null) {
		return;
	}

	if (groundGroupTarget.type === "infantry") {
		const usableLightAircrafts = getUsableAircraftsByType(state, coalition, faction.aircraftTypes["Light Attack"], 2);

		if (usableLightAircrafts.length >= 2) {
			const firstLightAircraft = firstItem(usableAircrafts);

			const selectedFirstAircrafts = usableLightAircrafts.filter(
				(ac) => ac.aircraftType === firstLightAircraft?.aircraftType
			);

			if (firstLightAircraft == null || selectedFirstAircrafts == null || selectedFirstAircrafts.length < 2) {
				return;
			}

			const startLightPosition =
				firstLightAircraft.homeBase.type === "airdrome"
					? dataStore.airdromes[firstLightAircraft.homeBase.name as DcsJs.AirdromeName]
					: firstItem(Object.values(faction.structures).filter((structure) => structure.type === "Farp"))?.position;

			if (startLightPosition == null) {
				return;
			}

			isHelicopter = dataStore.aircrafts?.[firstLightAircraft.aircraftType as DcsJs.AircraftType]?.isHelicopter;
			usableAircrafts = usableLightAircrafts;
			startPosition = startLightPosition;
		}
	}
	const headingObjectiveToAirdrome = headingToPosition(groundGroupTarget.position, startPosition);
	const racetrackStart = positionFromHeading(groundGroupTarget.position, headingObjectiveToAirdrome - 90, 7500);
	const racetrackEnd = positionFromHeading(groundGroupTarget.position, headingObjectiveToAirdrome + 90, 7500);
	const durationEnRoute = getDurationEnRoute(startPosition, groundGroupTarget.position, Config.flight.speed);
	const casDuration = Minutes(30);

	const startTime = Math.floor(state.timer) + Minutes(random(20, 35));
	const endEnRouteTime = startTime + durationEnRoute;
	const endOnStationTime = endEnRouteTime + 1 + casDuration;
	const [landingWaypoints, landingTime] = calcLandingWaypoints(
		groundGroupTarget.position,
		startPosition,
		endOnStationTime + 1
	);

	const cs = generateCallSign(coalition, state, dataStore, isHelicopter ? "helicopter" : "aircraft");

	const flightGroup: DcsJs.FlightGroup = {
		id: createUniqueId() + "-" + String(startTime),
		airdromeName: firstAircraft.homeBase.name as DcsJs.AirdromeName,
		units:
			usableAircrafts?.slice(0, 2).map((aircraft, i) => ({
				id: aircraft.id,
				callSign: cs.unitCallSign(i),
				name: cs.unitName(i),
				client: false,
				loadout: getLoadoutForAircraftType(aircraft.aircraftType as DcsJs.AircraftType, "CAS", dataStore),
			})) ?? [],
		name: cs.flightGroupName,
		task: "CAS",
		startTime,
		tot: endEnRouteTime + 1,
		landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(startPosition),
				time: startTime,
				speed: Config.flight.speed,
				onGround: true,
			},
			{
				name: "Track-race start",
				position: racetrackStart,
				speed: Config.flight.speed,
				duration: casDuration,
				time: endEnRouteTime + 1,
				taskStart: true,
				racetrack: {
					position: racetrackEnd,
					name: "Track-race end",
					distance: distanceToPosition(racetrackStart, racetrackEnd),
					duration: getDurationEnRoute(racetrackStart, racetrackEnd, Config.flight.speed),
				},
			},
			...landingWaypoints,
		],
		position: objectToPosition(startPosition),
		target: groundGroupTarget.id,
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	const flightGroups = [flightGroup];

	return {
		task: "CAS" as DcsJs.Task,
		startTime,
		taskEndTime: endOnStationTime,
		endTime: calcPackageEndTime(flightGroups),
		flightGroups,
		frequency: random(310, 343),
		id: createUniqueId(),
	};
};
