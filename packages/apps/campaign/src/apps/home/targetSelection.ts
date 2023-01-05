import { CampaignCoalition } from "@kilcekru/dcc-shared-rpc-types";
import { useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { Position } from "../../types";
import { findInside, oppositeCoalition, randomItem } from "../../utils";

export const useTargetSelection = () => {
	const [state] = useContext(CampaignContext);

	const casTarget = (coalition: CampaignCoalition, startPosition: Position) => {
		const oppCoalition = oppositeCoalition(coalition);

		const oppObjectives = state.objectives.filter((obj) => obj.coalition === oppCoalition);
		const objectivesWithAliveUnits = oppObjectives.filter(
			(obj) => obj.units.filter((unit) => unit.alive === true).length > 0
		);
		const objectivesInRange = findInside(objectivesWithAliveUnits, startPosition, (obj) => obj?.position, 60000);

		return randomItem(objectivesInRange);
	};

	return {
		casTarget,
	};
};
