import type * as DcsJs from "@foxdelta2/dcsjs";

import * as Domain from "../domain";
import { RunningCampaignState } from "./types";
import { getCoalitionFaction } from "./utils";

const cleanupFactionGroundGroups = (coalition: DcsJs.Coalition, state: RunningCampaignState) => {
	const faction = getCoalitionFaction(coalition, state);

	faction.groundGroups = faction.groundGroups.filter((gg) => {
		const hasAliveUnit = gg.unitIds.some((id) => {
			const unit = faction.inventory.groundUnits[id];
			return unit?.alive;
		});

		return hasAliveUnit;
	});

	faction.groundGroups = faction.groundGroups.filter((gg) => {
		return Domain.Location.InFrontlineRange(coalition, gg.position, state);
	});
};

export const cleanupGroundGroups = (state: RunningCampaignState) => {
	cleanupFactionGroundGroups("blue", state);
	cleanupFactionGroundGroups("red", state);
};
