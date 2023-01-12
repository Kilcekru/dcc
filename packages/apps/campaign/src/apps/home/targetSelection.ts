import type * as DcsJs from "@foxdelta2/dcsjs";
import { useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { useFaction } from "../../hooks";
import { Position } from "../../types";
import { findInside, findNearest, oppositeCoalition, randomItem } from "../../utils";

export const useTargetSelection = (coalition: DcsJs.CampaignCoalition) => {
	const [state] = useContext(CampaignContext);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = useFaction(oppCoalition);

	const casTarget = (startPosition: Position) => {
		const oppObjectives = state.objectives.filter((obj) => obj.coalition === oppCoalition);
		const objectivesWithAliveUnits = oppObjectives.filter(
			(obj) => obj.units.filter((unit) => unit.alive === true).length > 0
		);
		const objectivesInRange = findInside(objectivesWithAliveUnits, startPosition, (obj) => obj?.position, 60_000);

		return randomItem(objectivesInRange);
	};

	const deadTarget = (startPosition: Position) => {
		const oppSams = oppFaction?.sams.filter((sam) => sam.operational === true);

		const inRange = findInside(oppSams, startPosition, (sam) => sam.position, 100_000);

		return findNearest(inRange, startPosition, (sam) => sam.position);
	};

	const strikeTarget = (startPosition: Position) => {
		const oppObjectives = state.objectives.filter((obj) => obj.coalition === oppCoalition);
		const objectivesWithAliveStructures = oppObjectives.filter(
			(obj) => obj.structures.filter((structure) => structure.alive === true).length > 0
		);

		const objectivesInRange = findInside(objectivesWithAliveStructures, startPosition, (obj) => obj?.position, 100_000);

		return randomItem(objectivesInRange);
	};

	return {
		casTarget,
		deadTarget,
		strikeTarget,
	};
};
