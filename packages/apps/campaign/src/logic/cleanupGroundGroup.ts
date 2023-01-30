import * as DcsJs from "@foxdelta2/dcsjs";

import { RunningCampaignState } from "./types";

const cleanupFactionGroundGroups = (faction: DcsJs.CampaignFaction) => {
	faction.groundGroups = faction.groundGroups.filter((gg) => {
		const hasAliveUnit = gg.unitIds.some((id) => {
			const unit = faction.inventory.groundUnits[id];
			return unit?.alive;
		});

		return hasAliveUnit;
	});
};

export const cleanupGroundGroups = (state: RunningCampaignState) => {
	cleanupFactionGroundGroups(state.blueFaction);

	cleanupFactionGroundGroups(state.redFaction);
};
