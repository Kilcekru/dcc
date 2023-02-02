import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

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
import {
	calcLandingWaypoints,
	calcNearestOppositeAirdrome,
	generateCallSign,
	getCoalitionFaction,
	speed,
} from "../utils";

export const generateCapPackage = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: DataStore,
	objectiveName: string
): DcsJs.CampaignPackage | undefined => {
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	if (faction == null || oppFaction == null) {
		return;
	}

	const usableAircrafts = getUsableAircraftsByType(faction?.inventory.aircrafts, faction.aircraftTypes.cap);
	const airdromes = dataStore.airdromes;

	if (usableAircrafts == null || usableAircrafts.length === 0) {
		return;
	}

	if (airdromes == null) {
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
							const obj = findNearest(
								state.objectives.filter((obj) => obj.coalition === coalition),
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
						return [undefined, undefined];
					} else {
						const airdromes = faction.airdromeNames.map((name) => {
							if (dataStore.airdromes == null) {
								throw "undefined airdromes";
							}
							return dataStore.airdromes?.[name];
						});

						const airdrome = findNearest(airdromes, nearestObjective.position, (ad) => ad);

						return [nearestObjective.position, airdrome];
					}
			  })()
			: [
					objectToPosition(airdromes[objectiveName as DcsJs.AirdromeName]),
					airdromes[objectiveName as DcsJs.AirdromeName],
			  ];

	if (objectiveName == null || airdrome == null || objectivePosition == null) {
		throw `airdrome not found: ${objectiveName ?? ""}`;
	}

	const oppAirdrome = calcNearestOppositeAirdrome(coalition, state, dataStore, objectivePosition);
	const oppHeading = headingToPosition(objectivePosition, oppAirdrome);

	const heading = objectiveName === "Frontline" ? addHeading(oppHeading, 180) : oppHeading;

	const endPosition = positionFromHeading(objectivePosition, heading, objectiveName === "Frontline" ? 10_000 : 30_000);
	const durationEnRoute = getDurationEnRoute(airdrome, endPosition, speed);
	const headingObjectiveToAirdrome = headingToPosition(endPosition, oppAirdrome);
	const racetrackStart = positionFromHeading(endPosition, addHeading(headingObjectiveToAirdrome, -90), 20_000);
	const racetrackEnd = positionFromHeading(endPosition, addHeading(headingObjectiveToAirdrome, 90), 20_000);
	const duration = Minutes(60);
	const startTime = Math.floor(state.timer) + Minutes(random(20, 35));

	const endEnRouteTime = startTime + durationEnRoute;
	const endOnStationTime = endEnRouteTime + 1 + duration;
	const [, landingWaypoints, landingTime] = calcLandingWaypoints(racetrackEnd, airdrome, endEnRouteTime + 1);

	const cs = generateCallSign(state, dataStore, "aircraft");

	const flightGroup: DcsJs.CampaignFlightGroup = {
		id: createUniqueId(),
		airdromeName: airdrome.name,
		units:
			usableAircrafts?.slice(0, 2).map((aircraft, i) => ({
				id: aircraft.id,
				callSign: `${cs.unit}${i + 1}`,
				name: `${cs.flightGroup}-${i + 1}`,
				client: false,
			})) ?? [],
		name: cs.flightGroup,
		task: "CAP",
		startTime,
		tot: endEnRouteTime + 1,
		landingTime,
		waypoints: [
			{
				name: "Take Off",
				position: objectToPosition(airdrome),
				endPosition: racetrackStart,
				time: startTime,
				endTime: endEnRouteTime,
				speed,
				onGround: true,
			},
			{
				name: "Track-race start",
				position: racetrackStart,
				endPosition: racetrackEnd,
				speed,
				duration,
				time: endEnRouteTime + 1,
				endTime: endOnStationTime,
				taskStart: true,
				racetrack: {
					position: racetrackEnd,
					name: "Track-race end",
					distance: distanceToPosition(racetrackStart, racetrackEnd),
					duration: getDurationEnRoute(racetrackStart, racetrackEnd, speed),
				},
			},
			...landingWaypoints,
		],
		position: objectToPosition(airdrome),
		objective: {
			coalition: oppositeCoalition(coalition),
			name: objectiveName,
			position: endPosition,
			structures: [],
			deploymentReadyTimer: 0,
			incomingGroundGroups: {},
		},
	};

	const flightGroups = [flightGroup];

	return {
		task: "CAP" as DcsJs.Task,
		startTime,
		endTime: calcPackageEndTime(flightGroups),
		flightGroups,
		id: createUniqueId(),
	};
};
