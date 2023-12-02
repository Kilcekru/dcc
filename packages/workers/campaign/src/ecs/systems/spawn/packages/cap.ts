import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Entities } from "../../..";
import { CapFlightGroup } from "../../../entities";
import { world } from "../../../world";

export function cap(coalition: DcsJs.Coalition) {
	// Check the CAP capacity for each airdrome
	for (const airdrome of world.queries.airdromes[coalition]) {
		let capFgCount = 0;

		// Count the CAP flight groups
		for (const flightGroup of world.queries.flightGroups[coalition].get("CAP") ?? new Set()) {
			if (flightGroup instanceof CapFlightGroup) {
				if (flightGroup.target === airdrome) {
					capFgCount++;

					// Cancel the forEach if the CAP capacity is reached
					if (capFgCount >= Utils.Config.packages.CAP.maxActive[coalition]) {
						return;
					}
				}
			}
		}

		// Create a new CAP flight group if the CAP capacity is not reached
		if (capFgCount < Utils.Config.packages.CAP.maxActive[coalition]) {
			Entities.Package.create({
				coalition: coalition,
				task: "CAP",
				target: airdrome,
			});
		}
	}
}
