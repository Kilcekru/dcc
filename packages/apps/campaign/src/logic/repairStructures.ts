import * as DcsJs from "@foxdelta2/dcsjs";

import { RunningCampaignState } from "./types";
import { repairScoreCost } from "./utils";

const repairFactionStructures = (faction: DcsJs.CampaignFaction) => {
	Object.keys(faction.structures).forEach((name) => {
		const structure = faction.structures[name];
		structure?.buildings.forEach((building) => {
			if (!building.alive) {
				if (building.repairScore != null && building.repairScore > repairScoreCost) {
					building.alive = true;
					delete building.destroyedTime;
					delete building.repairScore;
				}
			}
		});
	});
};

export const repairStructures = (state: RunningCampaignState) => {
	repairFactionStructures(state.blueFaction);
	repairFactionStructures(state.redFaction);
};
