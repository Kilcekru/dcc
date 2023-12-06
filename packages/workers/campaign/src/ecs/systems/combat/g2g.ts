import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import type * as Entities from "../../entities";
import { world } from "../../world";

function calcHits(groundGroup: Entities.GroundGroup) {
	let hits = 0;
	for (const unit of groundGroup.units) {
		if (unit.alive) {
			const randomNumber = Utils.Random.number(1, 100);
			const hitChance = Utils.Config.combat.g2g.hitChange;

			if (randomNumber <= hitChance) {
				hits++;
			}
		}
	}

	return hits;
}

function hitGroundGroup(groundGroup: Entities.GroundGroup, hits: number) {
	if (hits === 0) {
		return false;
	}

	for (const unit of groundGroup.units) {
		if (unit.alive) {
			const groupDestroyed = groundGroup.destroyUnit(unit);

			if (groupDestroyed) {
				return true;
			}
			hits--;

			if (hits === 0) {
				return false;
			}
		}
	}

	return false;
}
function combatRound(attacker: Entities.GroundGroup, defender: Entities.GroundGroup) {
	const attackerHits = calcHits(attacker);
	const defenderHits = calcHits(defender);

	const attackerDestroyed = hitGroundGroup(attacker, defenderHits);
	const defenderDestroyed = hitGroundGroup(defender, attackerHits);

	if (attackerDestroyed) {
		return;
	}

	if (defenderDestroyed) {
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
	const groundGroups = world.queries.groundGroups[coalition].get("en route");

	for (const groundGroup of groundGroups) {
		const distance = Utils.Location.distanceToPosition(groundGroup.position, groundGroup.target.position);

		if (distance <= Utils.Config.combat.g2g.range) {
			// Is the objective defended?
			let defender: Entities.GroundGroup | undefined = undefined;

			for (const oppGroundGroup of world.queries.groundGroups[oppCoalition]) {
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
