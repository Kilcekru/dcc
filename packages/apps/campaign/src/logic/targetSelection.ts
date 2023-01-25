import * as DcsJs from "@foxdelta2/dcsjs";

import { Position } from "../types";
import { distanceToPosition, findInside, randomItem } from "../utils";

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
	const objectivesWithAliveUnits = oppObjectives.filter(
		(obj) => obj.units.filter((unit) => unit.alive === true).length > 0
	);
	const objectivesInRange = findInside(objectivesWithAliveUnits, startPosition, (obj) => obj?.position, 130_000);

	const objectivesOutsideSamRange = objectivesInRange.filter(
		(objective) => !isInSamRange(objective.position, oppFaction)
	);

	return randomItem(objectivesOutsideSamRange);
};
