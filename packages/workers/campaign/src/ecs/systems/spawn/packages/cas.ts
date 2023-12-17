import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Entities } from "../../..";
import { world } from "../../../world";

let inError = 0;

export function cas(coalition: DcsJs.Coalition) {
	if (inError > 0) {
		inError--;
		return;
	}

	const flightGroups = world.queries.flightGroups[coalition].get("CAS");

	// Create a new CAS flight group if the CAS capacity is not reached
	if (flightGroups.size < Utils.Config.packages.CAS.maxActive[coalition]) {
		try {
			Entities.Package.create({
				coalition: coalition,
				task: "CAS",
			});
		} catch (error) {
			inError = 10;
			// eslint-disable-next-line no-console
			console.error(error);
		}
	}
}
