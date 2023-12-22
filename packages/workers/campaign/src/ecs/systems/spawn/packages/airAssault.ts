import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import * as Entities from "../../../entities";
import { world } from "../../../world";

let inError = 0;

export function airAssault(coalition: DcsJs.Coalition) {
	if (inError > 0) {
		inError--;
		return;
	}

	const flightGroups = world.queries.flightGroups[coalition].get("Air Assault");

	// Create a new Air Assault flight group if the capacity is not reached and a unit camp is ready for deployment
	if (flightGroups.size < Utils.Config.packages["Air Assault"].maxActive[coalition]) {
		const oppCoalition = Utils.Coalition.opposite(coalition);
		// Loop threw all unit camps
		for (const unitCamp of world.queries.unitCamps[coalition]) {
			// Is the unit camp ready for deployment?
			if (unitCamp.alive && unitCamp.deploymentScore >= unitCamp.deploymentCostAirAssault) {
				// Search for a valid target
				let target: Entities.Objective | undefined;

				for (const objective of world.objectives.values()) {
					if (objective.coalition === oppCoalition && objective.incomingGroundGroup == null) {
						// Has the objective a armored ground group skip it
						const oppGroundGroups = world.queries.groundGroups[oppCoalition].get("on target");

						let groundGroupOnObjective: Entities.GroundGroup | undefined = undefined;

						for (const groundGroup of oppGroundGroups) {
							if (groundGroup.target === objective) {
								groundGroupOnObjective = groundGroup;
								break;
							}
						}

						if (groundGroupOnObjective != null) {
							if (groundGroupOnObjective.type === "armor") {
								continue;
							}
						}

						// Is the objective in range of the unit camp?
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

				try {
					Entities.Package.create({
						coalition: coalition,
						task: "Air Assault",
						unitCamp,
					});
				} catch (error) {
					inError = 10;
					// eslint-disable-next-line no-console
					console.error(error);
				}

				break;
			}
		}
	}
}
