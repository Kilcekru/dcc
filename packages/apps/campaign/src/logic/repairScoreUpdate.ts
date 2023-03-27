import * as DcsJs from "@foxdelta2/dcsjs";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";

import { RunningCampaignState } from "./types";

const updateFactionRepairScore = (faction: DcsJs.CampaignFaction, state: RunningCampaignState) => {
	Object.keys(faction.structures).forEach((name) => {
		const structure = faction.structures[name];
		structure?.buildings.forEach((building) => {
			if (!building.alive) {
				building.repairScore = (building.repairScore ?? 0) + 10 * state.multiplier;
			}
		});
	});
};

export function repairScoreUpdate(s: CampaignState) {
	if (s.blueFaction == null || s.redFaction == null) {
		return s;
	}

	const state = s as RunningCampaignState;

	updateFactionRepairScore(state.blueFaction, state);
	updateFactionRepairScore(state.redFaction, state);

	return s;
}
