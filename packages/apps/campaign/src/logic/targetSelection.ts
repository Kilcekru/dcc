import * as DcsJs from "@foxdelta2/dcsjs";

import { Position } from "../types";
import { distanceToPosition, findInside, findNearest, randomItem } from "../utils";

const isInSamRange = (position: Position, oppFaction: DcsJs.CampaignFaction) => {
	return oppFaction?.sams
		.filter((sam) => sam.operational)
		.some((sam) => distanceToPosition(position, sam.position) <= sam.range);
};

export const getCasTarget = (
	startPosition: Position,
	objectives: Array<DcsJs.CampaignObjective>,
	oppCoalition: DcsJs.CampaignCoalition,
	oppFaction: DcsJs.CampaignFaction
) => {
	const oppObjectives = objectives.filter((obj) => obj.coalition === oppCoalition);
	const objectivesWithAliveUnits = oppObjectives.filter((obj) =>
		obj.unitIds.some((id) => {
			const inventoryUnit = oppFaction.inventory.groundUnits[id];

			return inventoryUnit?.alive;
		})
	);
	const objectivesInRange = findInside(objectivesWithAliveUnits, startPosition, (obj) => obj?.position, 130_000);

	const objectivesOutsideSamRange = objectivesInRange.filter(
		(objective) => !isInSamRange(objective.position, oppFaction)
	);

	return randomItem(objectivesOutsideSamRange);
};

export const getDeadTarget = (startPosition: Position, oppFaction: DcsJs.CampaignFaction) => {
	const oppSams = oppFaction.sams.filter((sam) => sam.operational === true);

	const inRange = findInside(oppSams, startPosition, (sam) => sam.position, 100_000);

	return findNearest(inRange, startPosition, (sam) => sam.position);
};

export const getStrikeTarget = (
	startPosition: Position,
	objectives: Array<DcsJs.CampaignObjective>,
	oppCoalition: DcsJs.CampaignCoalition,
	oppFaction: DcsJs.CampaignFaction
) => {
	const oppObjectives = objectives.filter((obj) => obj.coalition === oppCoalition);
	const objectivesWithAliveStructures = oppObjectives.filter(
		(obj) => obj.structures.filter((structure) => structure.alive === true).length > 0
	);

	const objectivesInRange = findInside(objectivesWithAliveStructures, startPosition, (obj) => obj?.position, 100_000);
	const objectivesOutsideSamRange = objectivesInRange.filter(
		(objective) => !isInSamRange(objective.position, oppFaction)
	);

	const objective = randomItem(objectivesOutsideSamRange);

	if (objective == null) {
		return;
	}

	const target = randomItem(objective?.structures);

	return target;
};
