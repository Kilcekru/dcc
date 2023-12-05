import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { world } from "../../world";

function engage(coalition: DcsJs.Coalition) {
	const groundGroups = world.queries.groundGroups[coalition].get("en route");

	for (const groundGroup of groundGroups) {
		const distance = Utils.Location.distanceToPosition(groundGroup.position, groundGroup.target.position);

		if (distance <= Utils.Config.defaults.g2gRange) {
			// TODO: engage
		}
	}
}

export function g2g() {
	engage("blue");
	engage("red");
}
