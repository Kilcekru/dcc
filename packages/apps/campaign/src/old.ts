import * as DcsJs from "@foxdelta2/dcsjs";

import * as Domain from "./domain";
import { RunningCampaignState } from "./logic/types";
import { getCoalitionFaction } from "./logic/utils";
import { getFlightGroups, oppositeCoalition } from "./utils";

let moves = 0;
export function loadOld(state: Partial<DcsJs.CampaignState>, loops: number) {
	const start = performance.now();
	Array.from({ length: loops }).forEach(() => {
		MovementSystem(state);
	});
	const end = performance.now();

	// eslint-disable-next-line no-console
	console.log("old", end - start, moves);
}

function MovementSystem(state: Partial<DcsJs.CampaignState>) {
	flightGroup(state as RunningCampaignState, "blue");
	flightGroup(state as RunningCampaignState, "red");
}

function flightGroup(state: RunningCampaignState, coalition: DcsJs.Coalition) {
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	const fgs = getFlightGroups(faction.packages);
	const oppFgs = getFlightGroups(oppFaction.packages);

	fgs.forEach((fg) => {
		const nearby = Domain.Location.findInside(oppFgs, fg.position, (f) => f.position, 100000);

		if (nearby.length > 0) {
			moves++;
			fg.position.x += 1;
			fg.position.y += 1;
		}
	});
}
