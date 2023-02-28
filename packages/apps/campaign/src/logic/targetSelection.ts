import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";

import { Position } from "../types";
import {
	addHeading,
	distanceToPosition,
	findInside,
	findNearest,
	headingToPosition,
	positionFromHeading,
	random,
	randomItem,
} from "../utils";

const isInSamRange = (position: Position, oppFaction: DcsJs.CampaignFaction) => {
	return oppFaction?.sams
		.filter((sam) => sam.operational)
		.some((sam) => distanceToPosition(position, sam.position) <= sam.range);
};

export const getCasTarget = (startPosition: Position, oppFaction: DcsJs.CampaignFaction) => {
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

export const getDeadTarget = (startPosition: Position, oppFaction: DcsJs.CampaignFaction) => {
	const oppSams = oppFaction.sams.filter((sam) => sam.operational === true);

	const inRange = findInside(oppSams, startPosition, (sam) => sam.position, 150_000);

	return findNearest(inRange, startPosition, (sam) => sam.position);
};

export const getStrikeTarget = (
	startPosition: Position,
	objectives: Record<string, DcsJs.CampaignObjective>,
	oppCoalition: DcsJs.CampaignCoalition,
	oppFaction: DcsJs.CampaignFaction
): DcsJs.CampaignObjective | undefined => {
	const oppObjectives = Object.values(objectives).filter((obj) => obj.coalition === oppCoalition);
	const objectivesWithAliveStructures = oppObjectives.filter(
		(obj) =>
			obj.structures.filter((structure) => structure.buildings.find((building) => building.alive === true)).length > 0
	);

	const objectivesInRange = findInside(objectivesWithAliveStructures, startPosition, (obj) => obj?.position, 150_000);
	const objectivesOutsideSamRange = objectivesInRange.filter(
		(objective) => !isInSamRange(objective.position, oppFaction)
	);

	const objective = randomItem(objectivesOutsideSamRange);

	if (objective == null) {
		return;
	}

	const aliveStructures = objective.structures.filter((str) =>
		str.buildings.find((building) => building.alive === true)
	);

	const selectedStructures = randomItem(aliveStructures);

	if (selectedStructures == null) {
		return;
	}

	return {
		...objective,
		structures: [selectedStructures],
	};
};

export const awacsTarget = (
	coalition: DcsJs.CampaignCoalition,
	objectives: Record<string, DcsJs.CampaignObjective>,
	faction: DcsJs.CampaignFaction,
	oppFaction: DcsJs.CampaignFaction,
	dataStore: DataStore
): [Position, Position] | undefined => {
	const dataAirdromes = dataStore.airdromes;

	if (dataAirdromes == null) {
		return undefined;
	}
	const oppAirdromes = oppFaction.airdromeNames.map((name) => {
		return dataAirdromes[name];
	});

	const nearestObjective = oppAirdromes.reduce(
		(prev, airdrome) => {
			const obj = findNearest(
				Object.values(objectives).filter((obj) => obj.coalition === coalition),
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
		return undefined;
	}

	const airdromes = faction.airdromeNames.map((name) => {
		return dataAirdromes[name];
	});

	const airdromesInRange = findInside(airdromes, nearestObjective?.position, (airdrome) => airdrome, 280_000);

	const [fartestAirdrome] = airdromesInRange.reduce(
		(prev, airdrome) => {
			const distance = distanceToPosition(nearestObjective.position, airdrome);

			if (distance > prev[1]) {
				return [airdrome, distance] as [DcsJs.DCS.Airdrome, number];
			} else {
				return prev;
			}
		},
		[undefined, 0] as [DcsJs.DCS.Airdrome | undefined, number]
	);

	if (fartestAirdrome == null) {
		return undefined;
	}

	const heading = headingToPosition(nearestObjective.position, fartestAirdrome);

	const centerPosition = positionFromHeading(nearestObjective.position, heading, random(200_000, 280_000));

	const racetrackStart = positionFromHeading(centerPosition, addHeading(heading, -90), 40_000);
	const racetrackEnd = positionFromHeading(centerPosition, addHeading(heading, 90), 40_000);

	return [racetrackStart, racetrackEnd];
};
