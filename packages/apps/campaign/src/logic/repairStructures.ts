import * as DcsJs from "@foxdelta2/dcsjs";

import { Config } from "../data";
import { RunningCampaignState } from "./types";

const repairFactionStructures = (faction: DcsJs.CampaignFaction) => {
	Object.keys(faction.structures).forEach((name) => {
		const structure = faction.structures[name];
		structure?.buildings.forEach((building) => {
			if (!building.alive) {
				if (building.repairScore != null && building.repairScore > Config.deploymentScore.repair) {
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
