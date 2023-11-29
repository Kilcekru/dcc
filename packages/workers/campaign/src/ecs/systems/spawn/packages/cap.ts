import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { CapFlightGroup, isCapFlightGroup } from "../../../entities";
import { world } from "../../../world";

export function cap(coalition: DcsJs.Coalition) {
	const task: DcsJs.Task = "CAP";

	// Check the CAP capacity for each airdrome
	for (const airdrome of world.queries.airdromes[coalition]) {
		let capFgCount = 0;

		world.queries.flightGroups[coalition].forEach((fg) => {
			if (isCapFlightGroup(fg)) {
				if (fg.target === airdrome) {
					capFgCount++;

					// Cancel the forEach if the CAP capacity is reached
					if (capFgCount >= Utils.Config.packages.CAP.maxActive[coalition]) {
						return;
					}
				}
			}
		}, "CAP");

		// Create a new CAP flight group if the CAP capacity is not reached
		if (capFgCount < Utils.Config.packages.CAP.maxActive[coalition]) {
			const pkg = world.createPackage({
				coalition: coalition,
				task,
			});

			new CapFlightGroup({
				coalition: coalition,
				position: { x: 0, y: 0 },
				package: pkg,
				waypoints: [],
				target: airdrome,
			});
		}
	}
}
