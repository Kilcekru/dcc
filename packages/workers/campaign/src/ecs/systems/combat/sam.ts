import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { store } from "../../store";

function engage(coalition: DcsJs.Coalition) {
	const oppCoalition = Utils.Coalition.opposite(coalition);
	const sams = store.queries.SAMs[coalition];
	const oppFlightGroups = store.queries.flightGroups[oppCoalition].get("in air");

	for (const sam of sams) {
		if (!sam.readyToFire) {
			return;
		}

		for (const oppFlightGroup of oppFlightGroups) {
			if (oppFlightGroup.active) {
				const distance = Utils.Location.distanceToPosition(sam.position, oppFlightGroup.position);

				if (distance <= sam.range) {
					sam.fire(oppFlightGroup, distance);
				}
			}
		}
	}
}

export function sam() {
	engage("blue");
	engage("red");
}
