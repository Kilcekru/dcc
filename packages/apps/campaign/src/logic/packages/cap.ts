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
						console.error("no nearest objective found");
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
	const startTime = Math.floor(state.timer) + Minutes(random(10, 20));

	const endEnRouteTime = startTime + durationEnRoute;
	const endOnStationTime = endEnRouteTime + 1 + duration;
	const [landingWaypoints, landingTime] = calcLandingWaypoints(racetrackEnd, airdrome, endOnStationTime + 1);

	const cs = generateCallSign(coalition, state, dataStore, "aircraft");

	const flightGroup: DcsJs.CampaignFlightGroup = {
		id: createUniqueId(),
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
				speed,
				onGround: true,
			},
			{
				name: "Track-race start",
				position: racetrackStart,
				speed,
				duration,
				time: endEnRouteTime + 1,
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
		target: objectiveName
	};

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
