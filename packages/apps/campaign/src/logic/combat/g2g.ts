import * as DcsJs from "@foxdelta2/dcsjs";

import { oppositeCoalition, random } from "../../utils";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction } from "../utils";

const hasStillAliveUnits = (groundGroup: DcsJs.CampaignGroundGroup, faction: DcsJs.CampaignFaction) => {
	return groundGroup.unitIds.some((unitId) => {
		const unit = faction.inventory.groundUnits[unitId];

		return unit?.alive ?? false;
	});
};

const g2gBattle = (
	blueGroundGroup: DcsJs.CampaignGroundGroup,
	redGroundGroup: DcsJs.CampaignGroundGroup,
	state: RunningCampaignState
): DcsJs.CampaignCoalition => {
	if (random(1, 100) <= 50) {
		console.log(`Ground: ${blueGroundGroup.id} destroyed ground unit from group ${redGroundGroup.id}`); // eslint-disable-line no-console

		const aliveRedUnitId = redGroundGroup.unitIds.find(
			(unitId) => state.redFaction.inventory.groundUnits[unitId]?.alive === true
		);

		if (aliveRedUnitId == null) {
			throw "no alive red unit found";
		}

		const aliveRedUnit = state.redFaction.inventory.groundUnits[aliveRedUnitId];

		if (aliveRedUnit == null) {
			throw "no alive red unit found";
		}

		aliveRedUnit.alive = false;
		aliveRedUnit.destroyedTime = state.timer;
	} else {
		console.log(`Ground: ${blueGroundGroup.id} missed ground unit from group ${redGroundGroup.id}`); // eslint-disable-line no-console
	}

	if (random(1, 100) <= 50) {
		console.log(`Ground: ${redGroundGroup.id} destroyed ground unit from group ${blueGroundGroup.id}`); // eslint-disable-line no-console

		const aliveBlueUnitId = blueGroundGroup.unitIds.find(
			(unitId) => state.blueFaction.inventory.groundUnits[unitId]?.alive === true
		);

		if (aliveBlueUnitId == null) {
			throw "no alive red unit found";
		}

		const aliveBlueUnit = state.blueFaction.inventory.groundUnits[aliveBlueUnitId];

		if (aliveBlueUnit == null) {
			throw "no alive red unit found";
		}

		aliveBlueUnit.alive = false;
		aliveBlueUnit.destroyedTime = state.timer;
	} else {
		console.log(`Ground: ${redGroundGroup.id} missed ground unit from group ${blueGroundGroup.id}`); // eslint-disable-line no-console
	}

	const blueAlive = hasStillAliveUnits(blueGroundGroup, state.blueFaction);
	const redAlive = hasStillAliveUnits(redGroundGroup, state.redFaction);

	if (blueAlive && redAlive) {
		return g2gBattle(blueGroundGroup, redGroundGroup, state);
	} else if (blueAlive) {
		return "blue";
	} else {
		return "red";
	}
};

export const g2g = (
	attackingCoalition: DcsJs.CampaignCoalition,
	attackingGroundGroup: DcsJs.CampaignGroundGroup,
	state: RunningCampaignState
) => {
	const objective = attackingGroundGroup.objective;
	const defendingCoalition = oppositeCoalition(attackingCoalition);
	const defendingFaction = getCoalitionFaction(defendingCoalition, state);

	const defendingGroundGroup = defendingFaction.groundGroups.find(
		(gg) => gg.state === "on objective" && gg.objective.name === objective.name
	);

	if (defendingGroundGroup == null) {
		// eslint-disable-next-line no-console
		console.error("defending ground group not found", objective.name);
		return;
	}

	const blueGroundGroup = defendingCoalition === "blue" ? defendingGroundGroup : attackingGroundGroup;
	const redGroundGroup = defendingCoalition === "red" ? defendingGroundGroup : attackingGroundGroup;

	g2gBattle(blueGroundGroup, redGroundGroup, state);
};
