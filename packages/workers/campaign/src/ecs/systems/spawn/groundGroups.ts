import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import * as Entities from "../../entities";
import { store } from "../../store";

export function groundGroup(coalition: DcsJs.Coalition) {
	const oppCoalition = Utils.Coalition.opposite(coalition);
	// Loop threw all unit camps
	for (const unitCamp of store.queries.unitCamps[coalition]) {
		// Is the unit camp ready for deployment?
		if (unitCamp.alive && unitCamp.deploymentScore >= unitCamp.deploymentCost) {
			// If the max number of ground groups reached then stop spawning
			const ggsEnRoute = store.queries.groundGroups[coalition].get("en route");

			if (ggsEnRoute == null) {
				throw new Error("ggsEnRoute not found");
			}

			if (ggsEnRoute.size >= Utils.Config.deploymentScore.maxEnRoute[coalition]) {
				break;
			}

			// Search for a valid target
			let target: Entities.Objective | undefined;

			for (const objective of store.queries.objectives) {
				if (objective.coalition === oppCoalition && objective.incomingGroundGroup == null) {
					const distance = Utils.Location.distanceToPosition(unitCamp.position, objective.position);
					if (distance <= unitCamp.range) {
						target = objective;
						break;
					}
				}
			}

			if (target == null) {
				continue;
			}

			// Create the ground group
			const gg = Entities.GroundGroup.create({
				coalition,
				start: unitCamp.objective,
				target,
			});

			target.incomingGroundGroup = gg;

			unitCamp.deploymentScore -= unitCamp.deploymentCost;
		}
	}
}
