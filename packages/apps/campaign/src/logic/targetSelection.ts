import * as DcsJs from "@foxdelta2/dcsjs";

import { Position } from "../types";
import { distanceToPosition, findInside, findNearest, random, randomItem } from "../utils";

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
		(obj) => obj.structures.filter((structure) => structure.alive === true).length > 0
	);

	const objectivesInRange = findInside(objectivesWithAliveStructures, startPosition, (obj) => obj?.position, 150_000);
	const objectivesOutsideSamRange = objectivesInRange.filter(
		(objective) => !isInSamRange(objective.position, oppFaction)
	);

	const objective = randomItem(objectivesOutsideSamRange);

	if (objective == null) {
		return;
	}

	const highestGroupId = objective.structures.reduce((prev, structure) => {
		return structure.groupId > prev ? structure.groupId : prev;
	}, 0);

	const groupId = random(1, highestGroupId);

	return {
		...objective,
		structures: objective.structures.filter((str) => str.groupId === groupId),
	};
};
