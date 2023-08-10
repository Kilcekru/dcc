import type * as DcsJs from "@foxdelta2/dcsjs";
import { createUniqueId } from "solid-js";

import * as Domain from "../domain";

export function createDownedPilot(
	name: string,
	time: number,
	position: DcsJs.Position,
	coalition: DcsJs.CoalitionSide,
	faction: DcsJs.CampaignFaction,
	state: DcsJs.CampaignState,
) {
	const nearestObjective = Domain.Location.findNearest(
		Object.values(state.objectives),
		position,
		(obj) => obj.position,
	);

	if (nearestObjective == null || nearestObjective.coalition === coalition) {
		return faction;
	}

	faction.downedPilots.push({
		id: createUniqueId(),
		name,
		position,
		time,
	});

	return faction;
}
