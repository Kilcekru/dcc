import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import { Config } from "../../data";
import {
	addHeading,
	calcPackageEndTime,
	distanceToPosition,
	findNearest,
	getDurationEnRoute,
	getUsableAircraftsByType,
	headingToPosition,
	Minutes,
	objectToPosition,
	oppositeCoalition,
	positionFromHeading,
	random,
} from "../../utils";
import { RunningCampaignState } from "../types";
import { calcLandingWaypoints, calcNearestOppositeAirdrome, generateCallSign, getCoalitionFaction } from "../utils";
import { updateAircraftForFlightGroup } from "./utils";

export const generateCapPackage = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	objectiveName: string
): DcsJs.CampaignPackage | undefined => {
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	if (faction == null || oppFaction == null) {
		return;
	}

	const aircraftCount = random(2, 4);

	const usableAircrafts = getUsableAircraftsByType(state, coalition, faction.aircraftTypes.CAP, aircraftCount);
	const airdromes = dataStore.airdromes;

	if (usableAircrafts == null || usableAircrafts.length === 0) {
		return;
	}

	if (airdromes == null) {
		// eslint-disable-next-line no-console
		console.error("no airdromes found");
		return;
	}

	const [objectivePosition, airdrome] =
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
								(obj) => obj.position
							);

							if (obj == null) {
								return prev;
							}

							const distance = distanceToPosition(airdrome, obj.position);

							if (distance < prev[1]) {
								return [obj, distance] as [DcsJs.CampaignObjective, number];
							} else {
								return prev;
							}
						},
						[undefined, 1000000] as [DcsJs.CampaignObjective | undefined, number]
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

						return [nearestObjective.position, airdrome];
					}
			  })()
			: [
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					objectToPosition(airdromes[objectiveName as DcsJs.AirdromeName]!),
					airdromes[objectiveName as DcsJs.AirdromeName],
			  ];

	if (objectiveName == null || airdrome == null || objectivePosition == null) {
		// eslint-disable-next-line no-console
		console.warn(`airdrome not found: ${objectiveName ?? ""}`);
		return;
	}

	const oppAirdrome = calcNearestOppositeAirdrome(coalition, state, dataStore, objectivePosition);
	const oppHeading = headingToPosition(objectivePosition, oppAirdrome);

	const heading = objectiveName === "Frontline" ? addHeading(oppHeading, 180) : oppHeading;

	const endPosition = positionFromHeading(objectivePosition, heading, objectiveName === "Frontline" ? 10_000 : 30_000);
	const durationEnRoute = getDurationEnRoute(airdrome, endPosition, Config.flight.speed);
	const headingObjectiveToAirdrome = headingToPosition(endPosition, oppAirdrome);
	const racetrackStart = positionFromHeading(endPosition, addHeading(headingObjectiveToAirdrome, -90), 20_000);
	const racetrackEnd = positionFromHeading(endPosition, addHeading(headingObjectiveToAirdrome, 90), 20_000);
	const duration = Minutes(60);
	const startTime = Math.floor(state.timer) + Minutes(random(10, 20));

	const endEnRouteTime = startTime + durationEnRoute;
	const endOnStationTime = endEnRouteTime + 1 + duration;
	const [landingWaypoints, landingTime] = calcLandingWaypoints(racetrackEnd, airdrome, endOnStationTime + 1);

	const cs = generateCallSign(coalition, state, dataStore, "aircraft");

	const flightGroup: DcsJs.CampaignFlightGroup = {
		id: createUniqueId() + "-" + String(startTime),
		airdromeName: airdrome.name,
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
		tot: endEnRouteTime + 1,
		landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(airdrome),
				time: startTime,
				speed: Config.flight.speed,
				onGround: true,
			},
			{
				name: "Track-race start",
				position: racetrackStart,
				speed: Config.flight.speed,
				duration,
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
		position: objectToPosition(airdrome),
		target: objectiveName,
	};

	updateAircraftForFlightGroup(flightGroup, state, coalition, dataStore);

	const flightGroups = [flightGroup];

	return {
		task: "CAP" as DcsJs.Task,
		startTime,
		taskEndTime: endOnStationTime,
		endTime: calcPackageEndTime(flightGroups),
		flightGroups,
		frequency: random(310, 343),
		id: createUniqueId(),
	};
};
