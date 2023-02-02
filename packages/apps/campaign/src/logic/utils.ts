import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";

import { Position } from "../types";
import {
	addHeading,
	findNearest,
	getDurationEnRoute,
	getFlightGroups,
	headingToPosition,
	oppositeCoalition,
	positionFromHeading,
	randomCallSign,
} from "../utils";
import { RunningCampaignState } from "./types";

export const speed = 170;

export const getCoalitionFaction = (coalition: DcsJs.CampaignCoalition, state: RunningCampaignState) => {
	if (coalition === "blue") {
		return state.blueFaction;
	} else {
		return state.redFaction;
	}
};

const calcNumber = (
	state: RunningCampaignState,
	base: string,
	number: number
): { flightGroup: string; unit: string } => {
	const tmp = `${base}-${number}`;

	const fgs = [...getFlightGroups(state.blueFaction.packages), ...getFlightGroups(state.redFaction.packages)];

	const callSignFg = fgs.find((fg) => fg.name === tmp);

	if (callSignFg == null) {
		return {
			flightGroup: tmp,
			unit: `${base}${number}`,
		};
	}

	return calcNumber(state, base, number + 1);
};

export const generateCallSign = (
	state: RunningCampaignState,
	dataStore: DataStore,
	type: "aircraft" | "helicopter" | "awacs"
) => {
	const base = randomCallSign(dataStore, type);

	return calcNumber(state, base, 1);
};

const landingNavPosition = (engressPosition: Position, airdromePosition: Position) => {
	const heading = headingToPosition(engressPosition, airdromePosition);
	return positionFromHeading(airdromePosition, addHeading(heading, 180), 25000);
};

export const calcLandingWaypoints = (
	engressPosition: Position,
	airdromePosition: Position,
	startTime: number
): [Position, Array<DcsJs.CampaignWaypoint>, number] => {
	const navPosition = landingNavPosition(engressPosition, airdromePosition);
	const durationNav = getDurationEnRoute(engressPosition, navPosition, speed);
	const durationLanding = getDurationEnRoute(navPosition, airdromePosition, speed);
	const endNavTime = startTime + durationNav;
	const endLandingTime = endNavTime + 1 + durationLanding;

	return [
		navPosition,
		[
			{
				name: "Nav",
				position: navPosition,
				endPosition: airdromePosition,
				speed,
				time: startTime,
				endTime: endNavTime,
			},
			{
				name: "Landing",
				position: airdromePosition,
				endPosition: airdromePosition,
				speed,
				time: endNavTime + 1,
				endTime: endLandingTime,
				onGround: true,
			},
		],
		endLandingTime,
	];
};

export const calcNearestOppositeAirdrome = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: DataStore,
	position: Position
) => {
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);
	const airdromes = oppFaction.airdromeNames.map((name) => {
		if (dataStore.airdromes == null) {
			throw "undefined airdromes";
		}
		return dataStore.airdromes?.[name];
	});

	const airdrome = findNearest(airdromes, position, (ad) => ad);

	if (airdrome == null) {
		throw "undefined airdromes";
	}

	return airdrome;
};

export const unitIdsToGroundUnit = (faction: DcsJs.CampaignFaction, ids: Array<string>) => {
	return ids.reduce((prev, id) => {
		const unit = faction.inventory.groundUnits[id];

		if (unit == null) {
			return prev;
		} else {
			return [...prev, unit];
		}
	}, [] as Array<DcsJs.CampaignUnit>);
};
