import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import type * as Entities from "../../entities";
import { store } from "../../store";

function combatRound(attacker: Entities.GroundGroup, defender: Entities.GroundGroup) {
	attacker.fire(defender);
	defender.fire(attacker);

	if (!attacker.alive) {
		return;
	}

	if (!defender.alive) {
		attacker.target.conquer(attacker);

		return;
	}

	combatRound(attacker, defender);
}

function combat(attacker: Entities.GroundGroup, defender: Entities.GroundGroup) {
	combatRound(attacker, defender);
}

function engage(coalition: DcsJs.Coalition) {
	const oppCoalition = Utils.Coalition.opposite(coalition);
	const groundGroups = store.queries.groundGroups[coalition].get("en route");

	for (const groundGroup of groundGroups) {
		const distance = Utils.Location.distanceToPosition(groundGroup.position, groundGroup.target.position);

		if (distance <= Utils.Config.combat.g2g.range) {
			// Is the objective defended?
			let defender: Entities.GroundGroup | undefined = undefined;

			for (const oppGroundGroup of store.queries.groundGroups[oppCoalition]) {
				if (oppGroundGroup.target === groundGroup.target && oppGroundGroup.queries.has("groundGroups-on target")) {
					defender = oppGroundGroup;
					break;
				}
			}

			// If not, conquer it
			if (defender == null) {
				groundGroup.target.conquer(groundGroup);
				continue;
			}

			// Otherwise, fight
			combat(groundGroup, defender);
		}
	}
}

export function g2g() {
	engage("blue");
	engage("red");
}
