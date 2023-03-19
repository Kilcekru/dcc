import { CampaignFaction } from "@foxdelta2/dcsjs";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";

import { RunningCampaignState } from "./types";
import { isCampaignStructureUnitCamp } from "./utils";

function updateFactionDeploymentScore(faction: CampaignFaction, state: RunningCampaignState) {
	Object.values(faction.structures).forEach((structure) => {
		if (isCampaignStructureUnitCamp(structure)) {
			if (structure.state === "active") {
				const totalBuildings = structure.buildings.length;
				const aliveBuildings = structure.buildings.filter((building) => building.alive).length;

				const score = 12 * state.multiplier;
				const scorePerBuilding = Math.floor(score / totalBuildings);

				const factionStructure = faction.structures[structure.name];

				if (factionStructure == null) {
					throw "updateFactionDeploymentScore: depot not found";
				}

				if (isCampaignStructureUnitCamp(factionStructure)) {
					factionStructure.deploymentScore += scorePerBuilding * aliveBuildings;
				}
			}
		}
	});
}

export function deploymentScoreUpdate(s: CampaignState) {
	if (s.blueFaction == null || s.redFaction == null) {
		return s;
	}

	const state = s as RunningCampaignState;

	updateFactionDeploymentScore(state.blueFaction, state);
	updateFactionDeploymentScore(state.redFaction, state);

	return s;
}
