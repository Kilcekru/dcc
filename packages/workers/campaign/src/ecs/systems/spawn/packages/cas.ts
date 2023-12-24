import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Entities } from "../../..";
import { store } from "../../../store";

let inError = 0;

export function cas(coalition: DcsJs.Coalition) {
	if (inError > 0) {
		inError--;
		return;
	}

	const flightGroups = store.queries.flightGroups[coalition].get("CAS");

	// Create a new CAS flight group if the CAS capacity is not reached
	if (flightGroups.size < Utils.Config.packages.CAS.maxActive[coalition]) {
		try {
			const created = Entities.Package.create({
				coalition: coalition,
				task: "CAS",
			});

			if (created === false) {
				inError = 10;
			}
		} catch (error) {
			inError = 10;
			// eslint-disable-next-line no-console
			console.error(error);
		}
	}
}
