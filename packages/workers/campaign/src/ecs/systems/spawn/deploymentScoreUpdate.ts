import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { store } from "../../store";

export function deploymentScoreUpdate(coalition: DcsJs.Coalition) {
	// Loop threw all unit camps
	for (const unitCamp of store.queries.unitCamps[coalition]) {
		// Is the unit camp alive and does it have a deployment score less than the max score
		if (unitCamp.alive && unitCamp.deploymentScore < unitCamp.deploymentCost) {
			// Calculate the base score
			const totalBuildings = unitCamp.buildings.length;
			const aliveBuildings = unitCamp.buildings.filter((building) => building.alive).length;

			const score = Utils.Config.deploymentScore.base * store.timeMultiplier;
			const scorePerBuilding = Math.floor(score / totalBuildings);
			const aliveScore = scorePerBuilding * aliveBuildings;

			// Calculate the score factor
			let scoreFactor = 1;

			if (!unitCamp.hasPower) {
				scoreFactor -= Utils.Config.deploymentScore.penalty.power;
			}

			if (!unitCamp.hasAmmo) {
				scoreFactor -= Utils.Config.deploymentScore.penalty.ammo;
			}

			if (unitCamp.structureType === "Depot" && !unitCamp.hasFuel) {
				scoreFactor -= Utils.Config.deploymentScore.penalty.fuel;
			}

			// Update the deployment score
			unitCamp.deploymentScore += aliveScore * scoreFactor;

			if (unitCamp.deploymentScore > unitCamp.deploymentCost) {
				unitCamp.deploymentScore = unitCamp.deploymentCost;
			}
		}
	}
}
