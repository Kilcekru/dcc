import * as Utils from "@kilcekru/dcc-shared-utils";

import { RunningCampaignState } from "./types";
import { getCoalitionFaction } from "./utils";

export const airAssault = (state: RunningCampaignState) => {
	const faction = getCoalitionFaction("blue", state);

	faction.packages.forEach((pkg) => {
		pkg.flightGroups.forEach((fg) => {
			if (fg.task === "Air Assault" && fg.target != null) {
				const targetObjective = state.objectives[fg.target];

				if (targetObjective != null && Utils.distanceToPosition(fg.position, targetObjective.position) < 500) {
					const groundGroup = faction.groundGroups.find((gg) => gg.flightGroupId === fg.id);

					if (groundGroup == null) {
						return;
					}

					groundGroup.position = fg.position;
					groundGroup.state = "en route";
				}
			}
		});
	});
};
