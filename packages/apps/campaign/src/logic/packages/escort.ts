import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import { objectToPosition } from "../../utils";
import { RunningCampaignState } from "../types";
import { calcLandingWaypoints, generateCallSign, getCoalitionFaction } from "../utils";
import { getPackageAircrafts, updateAircraftForFlightGroup } from "./utils";

export function escortFlightGroup({
	coalition,
	state,
	dataStore,
	targetFlightGroup,
	holdWaypoint,
	egressPosition,
	egressTime,
	cruiseSpeed,
	packageAircrafts,
	frequency,
}: {
	coalition: DcsJs.Coalition;
	state: RunningCampaignState;
	dataStore: Types.Campaign.DataStore;
	targetFlightGroup: DcsJs.FlightGroup;
	holdWaypoint: DcsJs.CampaignWaypoint;
	egressPosition: DcsJs.Position;
	egressTime: number;
	cruiseSpeed: number;
	packageAircrafts: ReturnType<typeof getPackageAircrafts>;
	frequency: number;
}) {
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
		frequency,
		position: objectToPosition(packageAircrafts.startPosition),
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	return flightGroup;
}
