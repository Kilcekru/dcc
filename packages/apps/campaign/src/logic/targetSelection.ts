import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { Config } from "../data";
import * as Domain from "../domain";
import {
	addHeading,
	distanceToPosition,
	findInside,
	findNearest,
	headingToPosition,
	oppositeCoalition,
	positionFromHeading,
	random,
	randomItem,
} from "../utils";
import { RunningCampaignState } from "./types";
import {
	getCoalitionFaction,
	getCoalitionObjectives,
	getFarthestAirdromeFromPosition,
	getFrontlineObjective,
} from "./utils";

const isInSamRange = (position: DcsJs.Position, oppFaction: DcsJs.CampaignFaction) => {
	return Domain.Faction.getSamGroups(oppFaction)
		.filter((sam) => sam.operational)
		.some((sam) => distanceToPosition(position, sam.position) <= sam.range);
};

export const getCasTarget = (startPosition: DcsJs.Position, oppFaction: DcsJs.CampaignFaction) => {
	const objectivesGroundGroups = oppFaction.groundGroups.filter((gg) => gg.state === "on objective");
	const groundGroupsInRange = findInside(objectivesGroundGroups, startPosition, (obj) => obj?.position, 130_000);

	const aliveGroundGroups = groundGroupsInRange.filter((gg) => {
		return gg.unitIds.some((id) => {
			const inventoryUnit = oppFaction.inventory.groundUnits[id];

			return inventoryUnit?.alive;
		});
	});
	const groundGroupsOutsideSamRange = aliveGroundGroups.filter(
		(objective) => !isInSamRange(objective.position, oppFaction)
	);

	return findNearest(groundGroupsOutsideSamRange, startPosition, (group) => group.position);
};

export const getDeadTarget = (startPosition: DcsJs.Position, oppFaction: DcsJs.CampaignFaction) => {
	const oppSams = Domain.Faction.getSamGroups(oppFaction).filter((sam) => sam.operational === true);

	const inRange = findInside(oppSams, startPosition, (sam) => sam.position, 150_000);

	return findNearest(inRange, startPosition, (sam) => sam.position);
};

export const getStrikeTarget = (
	startPosition: DcsJs.Position,
	objectives: Record<string, DcsJs.Objective>,
	coalition: DcsJs.CampaignCoalition,
	faction: DcsJs.CampaignFaction,
	oppFaction: DcsJs.CampaignFaction
): DcsJs.Structure | undefined => {
	const factionObjectives = Object.values(objectives).filter((obj) => obj.coalition === coalition);
	const structures = Object.values(oppFaction.structures).filter((structure) => {
		// don't attack Farps
		if (structure.type === "Farp") {
			return false;
		}
		const alreadyTarget = faction.packages.find((pkg) => pkg.flightGroups.find((fg) => fg.target === structure.name));

		if (alreadyTarget) {
			return false;
		}

		const hasAliveBuildings = structure.buildings.some((building) => building.alive);

		// All buildings are destroyed
		if (!hasAliveBuildings) {
			return false;
		}

		const objectivesNearBarrack = findInside(factionObjectives, structure.position, (obj) => obj?.position, 100_000);

		// Barrack is not near frontline
		if (objectivesNearBarrack.length === 0) {
			return false;
		}

		return true;
	});

	const scoredStructures = structures.map((str) => {
		const distance = distanceToPosition(startPosition, str.position);

		let prio = 0;

		switch (str.type) {
			case "Ammo Depot": {
				const consumingStructures = structures.filter((str) => str.type === "Barrack" || str.type === "Depot");

				const inRangeStructures = findInside(
					consumingStructures,
					str.position,
					(s) => s.position,
					Config.structureRange.ammo
				);

				prio = 30 * inRangeStructures.length;

				break;
			}
			case "Power Plant": {
				const consumingStructures = structures.filter((str) => str.type === "Barrack" || str.type === "Depot");

				const inRangeStructures = findInside(
					consumingStructures,
					str.position,
					(s) => s.position,
					Config.structureRange.ammo
				);

				prio = 50 * inRangeStructures.length;

				break;
			}
			case "Command Center": {
				prio = 100;
			}
		}

		return {
			structure: str,
			score: distance / 1000 + prio,
		};
	});

	const sortedStructures = scoredStructures.sort((a, b) => b.score - a.score);

	const selectedStructure = randomItem(sortedStructures.slice(0, 2));

	return selectedStructure?.structure;
};

export const getAwacsTarget = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.DataStore
): [DcsJs.Position, DcsJs.Position] | undefined => {
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);
	const faction = getCoalitionFaction(coalition, state);

	const objectives = getCoalitionObjectives(coalition, state);
	const frontlineObjective = getFrontlineObjective(objectives, oppFaction.airdromeNames, dataStore);

	if (frontlineObjective == null) {
		return undefined;
	}

	const farthestAirdrome = getFarthestAirdromeFromPosition(
		frontlineObjective.position,
		faction.airdromeNames,
		dataStore
	);

	if (farthestAirdrome == null) {
		return undefined;
	}

	const heading = headingToPosition(frontlineObjective.position, farthestAirdrome);

	const centerPosition = positionFromHeading(
		frontlineObjective.position,
		heading,
		coalition === "blue" ? random(50_000, 70_000) : random(80_000, 120_000)
	);

	const racetrackStart = positionFromHeading(centerPosition, addHeading(heading, -90), 40_000);
	const racetrackEnd = positionFromHeading(centerPosition, addHeading(heading, 90), 40_000);

	return [racetrackStart, racetrackEnd];
};

export const getFrontlineTarget = (
	coalition: DcsJs.CampaignCoalition,
	sourcePosition: DcsJs.Position,
	range: number,
	state: RunningCampaignState
) => {
	const oppCoalition = oppositeCoalition(coalition);

	const oppObjectives = Object.values(state.objectives).filter(
		(obj) => obj.coalition === oppCoalition || obj.coalition === "neutral"
	);

	const freeOppObjectives = oppObjectives.filter((obj) => obj.incomingGroundGroups[coalition] == null);
	const objectivesInRange = findInside(freeOppObjectives, sourcePosition, (obj) => obj.position, range);

	if (objectivesInRange.length > 0) {
		const targetObjective = findNearest(objectivesInRange, sourcePosition, (obj) => obj.position);

		if (targetObjective == null) {
			return null;
		}

		return targetObjective;
	}

	return null;
};
