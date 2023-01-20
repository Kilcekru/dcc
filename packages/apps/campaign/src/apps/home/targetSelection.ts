import type * as DcsJs from "@foxdelta2/dcsjs";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { useFaction } from "../../hooks";
import { Position } from "../../types";
import { distanceToPosition, findInside, findNearest, oppositeCoalition, randomItem } from "../../utils";

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

		const objectivesOutsideSamRange = objectivesInRange.filter((objective) => !isInSamRange(objective.position));

		return randomItem(objectivesOutsideSamRange);
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
		const objectivesOutsideSamRange = objectivesInRange.filter((objective) => !isInSamRange(objective.position));

		const objective = randomItem(objectivesOutsideSamRange);

		if (objective == null) {
			return;
		}

		const target = randomItem(objective?.structures);

		return target;
	};

	const nearestOppositeAirdrome = async (position: Position) => {
		const oppAirdromeNames = oppFaction?.airdromeNames;

		if (oppAirdromeNames == null) {
			return;
		}

		const airdromes = await rpc.campaign.getAirdromes();

		const oppAirdromes = oppAirdromeNames.map((name) => airdromes[name]);

		return findNearest(oppAirdromes, position, (ad) => ({ x: ad.x, y: ad.y }));
	};

	const isInSamRange = (position: Position) => {
		return oppFaction?.sams
			.filter((sam) => sam.operational)
			.some((sam) => distanceToPosition(position, sam.position) <= sam.range);
	};

	return {
		casTarget,
		deadTarget,
		nearestOppositeAirdrome,
		strikeTarget,
	};
};
