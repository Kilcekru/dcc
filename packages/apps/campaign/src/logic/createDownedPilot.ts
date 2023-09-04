import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import { Config } from "../data";
import * as Domain from "../domain";

export function createDownedPilot(
	name: string,
	time: number,
	position: DcsJs.Position,
	coalition: DcsJs.CoalitionSide,
	faction: DcsJs.CampaignFaction,
	state: DcsJs.CampaignState,
	dataStore: Types.Campaign.DataStore,
) {
	const nearestObjective = Domain.Location.findNearest(
		Object.values(state.objectives),
		position,
		(obj) => obj.position,
	);

	if (nearestObjective == null || nearestObjective.coalition === coalition) {
		return faction;
	}

	const nearestFarp = Domain.Location.findNearest(
		Object.values(faction.structures).filter((str) => str.type === "Farp"),
		position,
		(str) => str.position,
	);
	const farpDistance =
		nearestFarp == null ? undefined : Domain.Location.distanceToPosition(position, nearestFarp.position);

	const airdromes = dataStore.airdromes;
	const factionAirdromes = airdromes == null ? [] : faction.airdromeNames.map((name) => airdromes[name]);

	const nearestAirdrome = Domain.Location.findNearest(factionAirdromes, position, (airdrome) =>
		airdrome == null ? { x: 0, y: 0 } : airdrome,
	);
	const airdromeDistance =
		nearestAirdrome == null ? undefined : Domain.Location.distanceToPosition(position, nearestAirdrome);

	let distance: number | undefined = undefined;

	if (farpDistance == null) {
		distance = airdromeDistance;
	} else {
		if (airdromeDistance == null) {
			distance = farpDistance;
		} else {
			if (farpDistance > airdromeDistance) {
				distance = airdromeDistance;
			} else {
				distance = farpDistance;
			}
		}
	}

	if (distance != null && distance <= Config.maxDistance.csar) {
		faction.downedPilots.push({
			id: createUniqueId(),
			name,
			position,
			time,
		});
	}

	return faction;
}
