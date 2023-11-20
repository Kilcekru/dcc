import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createUniqueId } from "solid-js";

import { Config } from "../../data";
import * as Domain from "../../domain";
import {
	addHeading,
	calcPackageEndTime,
	getDurationEnRoute,
	jtacFrequency,
	objectToPosition,
	oppositeCoalition,
	positionFromHeading,
} from "../../utils";
import * as Deploy from "../deploy";
import { RunningCampaignState } from "../types";
import {
	calcLandingWaypoints,
	calcNearestOppositeAirdrome,
	generateCallSign,
	getCoalitionFaction,
	getLoadoutForAircraftType,
} from "../utils";
import { calcFrequency, calcHoldWaypoint, getCruiseSpeed, getPackageAircrafts } from "./utils";

export const generateAirAssaultPackage = (
	coalition: DcsJs.Coalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
): DcsJs.FlightPackage | undefined => {
	const faction = getCoalitionFaction(coalition, state);

	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	const oppObjectives = Object.values(state.objectives).filter((obj) => obj.coalition === oppCoalition);

	const emptyOppObjectives = oppObjectives.filter((obj) => {
		!oppFaction.groundGroups.some((gg) => gg.objectiveName === obj.name);
	});

	let targets: Array<DcsJs.Objective> = [];

	if (emptyOppObjectives.length < 1) {
		const infantryGgs = oppFaction.groundGroups.filter((gg) => gg.type === "infantry");

		infantryGgs.forEach((gg) => {
			const obj = oppObjectives.find((obj) => obj.name === gg.objectiveName);

			if (obj == null) {
				return;
			}

			targets.push(obj);
		});
	} else {
		targets = emptyOppObjectives;
	}

	const packageAircrafts = getPackageAircrafts({
		aircraftTypes: faction.aircraftTypes["Air Assault"],
		task: "Air Assault",
		coalition,
		state,
		count: 2,
		dataStore,
		faction,
		withMaxDistance: {
			distance: Config.packages["Air Assault"].maxDistance,
			position: targets.map((obj) => obj.position),
		},
	});

	if (packageAircrafts?.startPosition == null) {
		// eslint-disable-next-line no-console
		console.warn("generateCsarPackage: start position not found", { packageAircrafts });
		return;
	}

	const target = Domain.Location.findNearest(targets, packageAircrafts.startPosition, (obj) => obj.position);

	if (target == null) {
		return;
	}

	const cruiseSpeed = getCruiseSpeed(packageAircrafts.aircrafts, dataStore);

	const aircraftType = Domain.Utils.firstItem(packageAircrafts.aircrafts)?.aircraftType as DcsJs.AircraftType;
	const isHelicopter = dataStore.aircrafts?.[aircraftType]?.isHelicopter;

	const ingressPosition = positionFromHeading(
		target.position,
		Utils.headingToPosition(target.position, packageAircrafts.startPosition),
		15000,
	);

	const activeAirAssaults = faction.packages.filter((pkg) => pkg.task === "Air Assault");
	const activeStartTime = activeAirAssaults.reduce((prev, pkg) => {
		if (pkg.startTime > prev) {
			return pkg.startTime;
		}

		return prev;
	}, 0);
	const nextAvailableStartTime = activeStartTime + Domain.Time.Minutes(Domain.Random.number(20, 30));
	const currentStartTime = Math.floor(state.timer) + Domain.Time.Minutes(Domain.Random.number(15, 20));
	const startTime = currentStartTime > nextAvailableStartTime ? currentStartTime : nextAvailableStartTime;

	const [holdWaypoint, holdPosition, holdTime] = calcHoldWaypoint(
		packageAircrafts.startPosition,
		ingressPosition,
		cruiseSpeed,
	);

	const oppAirdrome = calcNearestOppositeAirdrome(coalition, state, dataStore, target.position);
	const egressHeading =
		oppAirdrome == null
			? Utils.headingToPosition(target.position, packageAircrafts.startPosition)
			: Utils.headingToPosition(target.position, { x: oppAirdrome.x, y: oppAirdrome.y });
	const egressPosition = positionFromHeading(target.position, addHeading(egressHeading, 180), 20000);

	const durationEnRoute = getDurationEnRoute(holdPosition, ingressPosition, cruiseSpeed);
	const durationIngress = getDurationEnRoute(ingressPosition, target.position, cruiseSpeed);
	const durationEngress = getDurationEnRoute(target.position, egressPosition, cruiseSpeed);
	const endEnRouteTime = isHelicopter ? startTime + durationEnRoute : holdTime + durationEnRoute;
	const endIngressTime = endEnRouteTime + durationIngress;
	const endEgressTime = endIngressTime + durationEngress;

	const endOnStationTime = endEnRouteTime + 1;
	const [landingWaypoints, landingTime] = calcLandingWaypoints({
		egressPosition,
		airdromePosition: packageAircrafts.startPosition,
		prevWaypointTime: endEgressTime + 1,
		cruiseSpeed,
	});

	const cs = generateCallSign(state, dataStore, isHelicopter ? "helicopter" : "aircraft");

	const waypoints: Array<DcsJs.Waypoint> = [
		{
			name: "Take Off",
			position: objectToPosition(packageAircrafts.startPosition),
			time: 0,
			speed: cruiseSpeed,
			onGround: true,
		},
	];

	if (!isHelicopter) {
		waypoints.push(holdWaypoint);
	}

	waypoints.push({
		name: "Drop Off",
		position: target.position,
		speed: cruiseSpeed,
		time: endIngressTime + 1,
		taskStart: true,
		onGround: true,
	});

	waypoints.push({
		name: "Egress",
		position: egressPosition,
		speed: cruiseSpeed,
		time: endEgressTime + 1,
	});
	waypoints.push(...landingWaypoints);

	const flightGroup: DcsJs.FlightGroup = {
		id: createUniqueId() + "-" + String(startTime),
		airdromeName: packageAircrafts.startPosition.name,
		units:
			packageAircrafts.aircrafts.slice(0, 2).map((aircraft, i) => ({
				id: aircraft.id,
				callSign: cs.unitCallSign(i),
				name: cs.unitName(i),
				client: false,
				loadout: getLoadoutForAircraftType(aircraft.aircraftType as DcsJs.AircraftType, "Air Assault", dataStore),
			})) ?? [],
		name: cs.flightGroupName,
		task: "Air Assault",
		startTime,
		designatedStartTime: startTime,
		tot: endEnRouteTime + 1,
		landingTime,
		waypoints: waypoints,
		jtacFrequency: jtacFrequency(faction),
		position: objectToPosition(packageAircrafts.startPosition),
		target: target.name,
	};

	const flightGroups = [flightGroup];

	Deploy.flightGroups(flightGroups, state, coalition, dataStore);

	const startObjective = Domain.Location.findNearest(
		Object.values(state.objectives),
		packageAircrafts.startPosition,
		(obj) => obj.position,
	);

	if (startObjective == null) {
		return;
	}

	Deploy.groundGroup({
		targetObjective: target,
		dataStore,
		groupType: "infantry",
		groupState: "air assault",
		startObjective: startObjective,
		state,
		flightGroupId: flightGroup.id,
	});

	const barracks = Domain.Structure.getAirAssaultReadyBarracks(faction);
	const barrack = Domain.Location.findNearest(barracks, packageAircrafts.startPosition, (s) => s.position);

	if (barrack != null) {
		barrack.deploymentScore = 0;
	}

	return {
		task: "Air Assault" as DcsJs.Task,
		startTime,
		taskEndTime: endOnStationTime,
		endTime: calcPackageEndTime(startTime, flightGroups),
		flightGroups,
		frequency: calcFrequency(aircraftType, faction, dataStore),
		id: createUniqueId(),
	};
};
