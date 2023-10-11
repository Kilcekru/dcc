import type * as DcsJs from "@foxdelta2/dcsjs";

import { Config } from "../data";
import * as Domain from "../domain";
import { getDeploymentCost, hasAmmoDepotInRange, hasFuelStorageInRange, hasPowerInRange } from "../utils";
import { RunningCampaignState } from "./types";
import { getCoalitionFaction } from "./utils";

function updateFactionDeploymentScore(coalition: DcsJs.Coalition, state: RunningCampaignState) {
	const faction = getCoalitionFaction(coalition, state);
	Object.values(faction.structures).forEach((structure) => {
		if (Domain.Structure.isCampaignStructureUnitCamp(structure)) {
			const maxScore = getDeploymentCost(coalition, structure.type);

			if (structure.state === "active" && structure.deploymentScore < maxScore) {
				const totalBuildings = structure.buildings.length;
				const aliveBuildings = structure.buildings.filter((building) => building.alive).length;

				const score = Config.deploymentScore.base * state.multiplier;
				const scorePerBuilding = Math.floor(score / totalBuildings);

				const factionStructure = faction.structures[structure.name];

				if (factionStructure == null) {
					throw "updateFactionDeploymentScore: depot not found";
				}

				if (Domain.Structure.isCampaignStructureUnitCamp(factionStructure)) {
					let scoreFactor = 1;

					if (!hasPowerInRange(structure.position, faction)) {
						scoreFactor -= Config.deploymentScore.penalty.power;
					}

					if (!hasAmmoDepotInRange(structure.position, faction)) {
						scoreFactor -= Config.deploymentScore.penalty.ammo;
					}

					if (factionStructure.type === "Depot") {
						if (!hasFuelStorageInRange(structure.position, faction)) {
							scoreFactor -= Config.deploymentScore.penalty.fuel;
						}
					}

					factionStructure.deploymentScore += scorePerBuilding * aliveBuildings * scoreFactor;

					if (factionStructure.deploymentScore > maxScore) {
						factionStructure.deploymentScore = maxScore;
					}
				}
			}
		}
	});
}

export function deploymentScoreUpdate(s: DcsJs.CampaignState) {
	if (s.blueFaction == null || s.redFaction == null) {
		return s;
	}

	const state = s as RunningCampaignState;

	updateFactionDeploymentScore("blue", state);
	updateFactionDeploymentScore("red", state);

	return s;
}
