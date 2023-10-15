import type * as DcsJs from "@foxdelta2/dcsjs";

import { RunningCampaignState } from "./types";
import { getCoalitionFaction } from "./utils";

function updateStructureState(
	coalition: DcsJs.Coalition,
	state: RunningCampaignState,
	camp: DcsJs.Structure | undefined,
) {
	if (camp == null) {
		throw "cleanupFactionStructures: barrack not found";
	}

	const structureObjective = state.objectives[camp.objectiveName];

	if (structureObjective == null) {
		// eslint-disable-next-line no-console
		console.error("cleanupFactionStructures: objective not found", camp);
		throw "cleanupFactionStructures: objective not found";
	}

	let targetState: DcsJs.CampaignStructureState = "active";

	if (structureObjective.coalition !== coalition) {
		targetState = "deactivated";
	} else {
		const hasAliveBuildings = camp.buildings.some((building) => building.alive);

		targetState = hasAliveBuildings ? "active" : "destroyed";
	}

	if (targetState != camp.state) {
		camp.state = targetState;
	}
}

function cleanupFactionStructures(coalition: DcsJs.Coalition, state: RunningCampaignState) {
	const faction = getCoalitionFaction(coalition, state);

	Object.keys(faction.structures).forEach((key) => {
		const structure = faction.structures[key];

		updateStructureState(coalition, state, structure);
	});
}

export function cleanupStructures(state: RunningCampaignState) {
	cleanupFactionStructures("blue", state);
	cleanupFactionStructures("red", state);
}
