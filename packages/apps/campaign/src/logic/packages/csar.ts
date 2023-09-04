import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import { Config } from "../../data";
import * as Domain from "../../domain";
import { calcPackageEndTime, getDurationEnRoute, Minutes, objectToPosition, random } from "../../utils";
import { RunningCampaignState } from "../types";
import { generateCallSign, getCoalitionFaction } from "../utils";
import { calcFrequency, getCruiseSpeed, getPackageAircrafts, updateAircraftForFlightGroup } from "./utils";

export const generateCsarPackage = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	downedPilot: DcsJs.DownedPilot,
): DcsJs.CampaignPackage | undefined => {
	const faction = getCoalitionFaction(coalition, state);

	if (dataStore?.airdromes == null) {
		return;
	}

	const validDropStructures = Object.values(faction.structures).filter(
		(str) => str.type === "Farp" || str.type === "Hospital",
	);

	const dropStructure = Domain.Location.findNearest(validDropStructures, downedPilot.position, (str) => str.position);

	if (dropStructure == null) {
		// eslint-disable-next-line no-console
		console.warn("generateCsarPackage: no drop structure found");
		return;
	}

	const packageAircrafts = getPackageAircrafts({
		aircraftTypes: faction.aircraftTypes["CSAR"],
		coalition,
		state,
		count: 1,
		dataStore,
		faction,
		withMaxDistance: {
			distance: Config.maxDistance.csar,
			position: downedPilot.position,
		},
	});

	if (packageAircrafts?.startPosition == null) {
		// eslint-disable-next-line no-console
		console.warn("generateCsarPackage: start position not found", { packageAircrafts });
		return;
	}

	const cruiseSpeed = getCruiseSpeed(packageAircrafts.aircrafts, dataStore);

	const aircraftType = Domain.Utils.firstItem(packageAircrafts.aircrafts)?.aircraftType as DcsJs.AircraftType;

	const startTime = Math.floor(state.timer) + Minutes(random(10, 30));

	const durationIngress = getDurationEnRoute(packageAircrafts.startPosition, downedPilot.position, cruiseSpeed);
	const durationDropLocation = getDurationEnRoute(downedPilot.position, dropStructure.position, cruiseSpeed);

	const cs = generateCallSign(coalition, state, dataStore, "aircraft");

	const pickUpTime = Minutes(10) + durationIngress;
	const dropOffTime = pickUpTime + Minutes(2) + durationDropLocation;

	const isDropOffLanding = dropStructure.name === packageAircrafts.startPosition.name;

	const durationLanding = getDurationEnRoute(dropStructure.position, packageAircrafts.startPosition, cruiseSpeed);

	const landingTime = isDropOffLanding ? dropOffTime : dropOffTime + Minutes(2) + durationLanding;

	const flightGroup: DcsJs.FlightGroup = {
		id: createUniqueId() + "-" + String(startTime),
		airdromeName: packageAircrafts.startPosition.name,
		units:
			packageAircrafts.aircrafts?.slice(0, 1).map((aircraft, i) => ({
				id: aircraft.id,
				callSign: cs.unitCallSign(i),
				name: cs.unitName(i),
				client: false,
			})) ?? [],
		name: cs.flightGroupName,
		task: "CSAR",
		startTime,
		designatedStartTime: startTime,
		tot: pickUpTime,
		landingTime: landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(packageAircrafts.startPosition),
				time: 0,
				speed: cruiseSpeed,
				onGround: true,
			},
			{
				name: "Pick Up",
				position: downedPilot.position,
				speed: cruiseSpeed,
				time: pickUpTime,
				taskStart: true,
				onGround: true,
			},
			...(isDropOffLanding
				? [
						{
							name: "Landing",
							position: objectToPosition(packageAircrafts.startPosition),
							time: landingTime,
							speed: cruiseSpeed,
							onGround: true,
						},
				  ]
				: [
						{
							name: "Drop Off",
							position: objectToPosition(dropStructure.position),
							time: dropOffTime,
							speed: cruiseSpeed,
							onGround: true,
						},
						{
							name: "Landing",
							position: objectToPosition(packageAircrafts.startPosition),
							time: landingTime,
							speed: cruiseSpeed,
							onGround: true,
						},
				  ]),
		],
		target: downedPilot.id,
		position: objectToPosition(packageAircrafts.startPosition),
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	const flightGroups = [flightGroup];

	return {
		task: "CSAR" as DcsJs.Task,
		startTime,
		taskEndTime: dropOffTime,
		endTime: calcPackageEndTime(startTime, flightGroups),
		flightGroups,
		frequency: calcFrequency(aircraftType, dataStore),
		id: createUniqueId(),
	};
};
