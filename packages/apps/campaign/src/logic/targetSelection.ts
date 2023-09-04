import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Config } from "../data";
import * as Domain from "../domain";
import {
	addHeading,
	findInside,
	findNearest,
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
		.some((sam) => Utils.distanceToPosition(position, sam.position) <= sam.range);
};

export const getCasTarget = (startPosition: DcsJs.Position, oppFaction: DcsJs.CampaignFaction) => {
	const objectivesGroundGroups = oppFaction.groundGroups.filter(
		(gg) => gg.state === "on objective" && gg.type !== "sam",
	);
	const groundGroupsInRange = findInside(
		objectivesGroundGroups,
		startPosition,
		(obj) => obj?.position,
		Config.maxDistance.cas,
	);

	const aliveGroundGroups = groundGroupsInRange.filter((gg) => {
		return gg.unitIds.some((id) => {
			const inventoryUnit = oppFaction.inventory.groundUnits[id];

			return inventoryUnit?.alive;
		});
	});
	const groundGroupsOutsideSamRange = aliveGroundGroups.filter(
		(objective) => !isInSamRange(objective.position, oppFaction),
	);

	return findNearest(groundGroupsOutsideSamRange, startPosition, (group) => group.position);
};

export const getDeadTarget = (startPosition: DcsJs.Position, oppFaction: DcsJs.CampaignFaction) => {
	const oppSams = Domain.Faction.getSamGroups(oppFaction).filter((sam) => sam.operational === true);

	const inRange = findInside(oppSams, startPosition, (sam) => sam.position, Config.maxDistance.dead);

	return findNearest(inRange, startPosition, (sam) => sam.position);
};

export const getStrikeTarget = (
	startPosition: DcsJs.Position,
	objectives: Record<string, DcsJs.Objective>,
	coalition: DcsJs.CampaignCoalition,
	faction: DcsJs.CampaignFaction,
	oppFaction: DcsJs.CampaignFaction,
): DcsJs.Structure | undefined => {
	const factionObjectives = Object.values(objectives).filter((obj) => obj.coalition === coalition);
	const structures = Object.values(oppFaction.structures).filter((structure) => {
		// don't attack Farps
		if (structure.type === "Farp" || structure.type === "Hospital") {
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
		const distance = Utils.distanceToPosition(startPosition, str.position);

		let prio = 0;

		switch (str.type) {
			case "Ammo Depot": {
				const consumingStructures = structures.filter((str) => str.type === "Barrack" || str.type === "Depot");

				const inRangeStructures = findInside(
					consumingStructures,
					str.position,
					(s) => s.position,
					Config.structureRange.ammo,
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
					Config.structureRange.ammo,
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
	dataStore: Types.Campaign.DataStore,
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
		dataStore,
	);

	if (farthestAirdrome == null) {
		return undefined;
	}

	const heading = Utils.headingToPosition(frontlineObjective.position, farthestAirdrome);

	const centerPosition = positionFromHeading(
		frontlineObjective.position,
		heading,
		coalition === "blue" ? random(50_000, 70_000) : random(80_000, 120_000),
	);

	const racetrackStart = positionFromHeading(centerPosition, addHeading(heading, -90), 40_000);
	const racetrackEnd = positionFromHeading(centerPosition, addHeading(heading, 90), 40_000);

	return [racetrackStart, racetrackEnd];
};

export const getFrontlineTarget = (
	coalition: DcsJs.CampaignCoalition,
	sourcePosition: DcsJs.Position,
	range: number,
	state: RunningCampaignState,
) => {
	const faction = getCoalitionFaction(coalition, state);
	const unprotectedObjectives = Object.values(state.objectives).filter(
		(obj) =>
			obj.coalition === coalition &&
			obj.incomingGroundGroups[coalition] == null &&
			!faction.groundGroups.some((gg) => gg.objectiveName === obj.name),
	);

	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);
	const oppObjectives = Object.values(state.objectives).filter(
		(obj) => obj.coalition === oppCoalition || obj.coalition === "neutral",
	);

	const unprotectedFrontlineObjectives: Array<DcsJs.Objective> = [];
	oppFaction.groundGroups.forEach((oppGg) => {
		const ggsInRange = Domain.Location.findInside(
			faction.groundGroups,
			oppGg.position,
			(gg) => gg.position,
			Config.structureRange.frontline.depot,
		);
		const objectivesInRange = Domain.Location.findInside(
			unprotectedObjectives,
			oppGg.position,
			(obj) => obj.position,
			Config.structureRange.frontline.depot,
		);

		if (ggsInRange.length === 0 && objectivesInRange.length > 0) {
			objectivesInRange.forEach((obj) => unprotectedFrontlineObjectives.push(obj));
		}
	});

	if (unprotectedFrontlineObjectives.length > 0) {
		return Domain.Utils.randomItem(unprotectedFrontlineObjectives);
	}

	const freeOppObjectives = oppObjectives.filter((obj) => obj.incomingGroundGroups[coalition] == null);
	const objectivesInRange = Domain.Location.findInside(freeOppObjectives, sourcePosition, (obj) => obj.position, range);

	if (objectivesInRange.length > 0) {
		const targetObjective = Domain.Location.findNearest(objectivesInRange, sourcePosition, (obj) => obj.position);

		if (targetObjective == null) {
			return null;
		}

		return targetObjective;
	}

	return null;
};
