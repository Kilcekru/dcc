import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Entities } from "../../..";
import { store } from "../../../store";

let inError = 0;

export function dead(coalition: DcsJs.Coalition) {
	if (inError > 0) {
		inError--;
		return;
	}

	const flightGroups = store.queries.flightGroups[coalition].get("DEAD");

	// Create a new DEAD package if the DEAD capacity is not reached
	if (flightGroups.size < Utils.Config.packages["DEAD"].maxActive[coalition]) {
		try {
			const created = Entities.Package.create({
				coalition: coalition,
				task: "DEAD",
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
