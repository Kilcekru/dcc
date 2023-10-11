import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createUniqueId } from "solid-js";

import * as Domain from "../../domain";
import {
	addHeading,
	calcPackageEndTime,
	findNearest,
	getDurationEnRoute,
	getUsableAircraftsByType,
	objectToPosition,
	oppositeCoalition,
	positionFromHeading,
} from "../../utils";
import { RunningCampaignState } from "../types";
import { calcLandingWaypoints, calcNearestOppositeAirdrome, generateCallSign, getCoalitionFaction } from "../utils";
import { calcFrequency, getCruiseSpeed, updateAircraftForFlightGroup } from "./utils";

export const generateCapPackage = (
	coalition: DcsJs.Coalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	objectiveName: string,
): DcsJs.FlightPackage | undefined => {
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	if (faction == null || oppFaction == null) {
		return;
	}

	const usableAircrafts = getUsableAircraftsByType(state, coalition, faction.aircraftTypes.CAP, 2);
	const aircraftType = Domain.Utils.firstItem(usableAircrafts)?.aircraftType as DcsJs.AircraftType;
	const airdromes = dataStore.airdromes;

	if (usableAircrafts == null || usableAircrafts.length === 0) {
		return;
	}

	if (airdromes == null) {
		// eslint-disable-next-line no-console
		console.error("no airdromes found");
		return;
	}

	const [objectivePosition, airdromeName] =
		objectiveName === "Frontline"
			? (() => {
					const oppAirdromes = oppFaction.airdromeNames.map((name) => {
						return airdromes[name];
					});

					const nearestObjective = oppAirdromes.reduce(
						(prev, airdrome) => {
							if (airdrome == null) {
								throw `generateCapPackage: airdrome not found`;
							}

							const obj = findNearest(
								Object.values(state.objectives).filter((obj) => obj.coalition === coalition),
								airdrome,
								(obj) => obj.position,
							);

							if (obj == null) {
								return prev;
							}

							const distance = Utils.distanceToPosition(airdrome, obj.position);

							if (distance < prev[1]) {
								return [obj, distance] as [DcsJs.Objective, number];
							} else {
								return prev;
							}
						},
						[undefined, 1000000] as [DcsJs.Objective | undefined, number],
					)[0];

					if (nearestObjective == null) {
						// eslint-disable-next-line no-console
						console.warn("no nearest objective found");
						return [undefined, undefined];
					} else {
						const airdromes = faction.airdromeNames.map((name) => {
							const airdrome = dataStore.airdromes?.[name];
							if (airdrome == null) {
								throw "undefined airdromes";
							}
							return airdrome;
						});

						const airdrome = findNearest(airdromes, nearestObjective.position, (ad) => ad);

						if (airdrome == null) {
							return [undefined, undefined];
						}

						return [objectToPosition(airdrome), airdrome.name];
					}
			  })()
			: (() => {
					const airdrome = airdromes[objectiveName as DcsJs.AirdromeName];

					if (airdrome == null) {
						const carrier = faction.shipGroups?.find((sg) => sg.name === objectiveName);

						if (carrier == null) {
							return [undefined, undefined];
						}

						return [carrier.position, carrier.name];
					}

					return [objectToPosition(airdrome), airdrome.name];
			  })();

	if (objectiveName == null || airdromeName == null || objectivePosition == null) {
		// eslint-disable-next-line no-console
		console.warn(`airdrome not found: ${objectiveName ?? ""}`);
		return;
	}

	const cruiseSpeed = getCruiseSpeed(usableAircrafts, dataStore);

	const oppAirdrome = calcNearestOppositeAirdrome(coalition, state, dataStore, objectivePosition);
	const oppHeading = Utils.headingToPosition(objectivePosition, oppAirdrome);

	const heading = objectiveName === "Frontline" ? addHeading(oppHeading, 180) : oppHeading;

	const endPosition = positionFromHeading(objectivePosition, heading, objectiveName === "Frontline" ? 10_000 : 30_000);
	const durationEnRoute = getDurationEnRoute(objectivePosition, endPosition, cruiseSpeed);
	const headingObjectiveToAirdrome = Utils.headingToPosition(endPosition, oppAirdrome);
	const racetrackStart = positionFromHeading(endPosition, addHeading(headingObjectiveToAirdrome, -90), 20_000);
	const racetrackEnd = positionFromHeading(endPosition, addHeading(headingObjectiveToAirdrome, 90), 20_000);
	const duration = Domain.Time.Hours(1);
	const startTime = Math.floor(state.timer) + Domain.Time.Minutes(Domain.Random.number(10, 20));

	const endEnRouteTime = durationEnRoute;
	const endOnStationTime = endEnRouteTime + 1 + duration;
	const [landingWaypoints, landingTime] = calcLandingWaypoints({
		egressPosition: racetrackEnd,
		airdromePosition: objectivePosition,
		prevWaypointTime: endOnStationTime + 1,
		cruiseSpeed,
	});

	const cs = generateCallSign(coalition, state, dataStore, "aircraft");

	const flightGroup: DcsJs.FlightGroup = {
		id: createUniqueId() + "-" + String(startTime),
		airdromeName,
		units:
			usableAircrafts?.slice(0, 2).map((aircraft, i) => ({
				id: aircraft.id,
				callSign: cs.unitCallSign(i),
				name: cs.unitName(i),
				client: false,
			})) ?? [],
		name: cs.flightGroupName,
		task: "CAP",
		startTime,
		designatedStartTime: startTime,
		tot: endEnRouteTime + 1,
		landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(objectivePosition),
				time: startTime,
				speed: cruiseSpeed,
				onGround: true,
			},
			{
				name: "Track-race start",
				position: racetrackStart,
				speed: cruiseSpeed,
				duration,
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
		position: objectToPosition(objectivePosition),
		target: objectiveName,
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	const flightGroups = [flightGroup];

	return {
		task: "CAP" as DcsJs.Task,
		startTime,
		taskEndTime: endOnStationTime,
		endTime: calcPackageEndTime(startTime, flightGroups),
		flightGroups,
		frequency: calcFrequency(aircraftType, faction, dataStore),
		id: createUniqueId(),
	};
};
