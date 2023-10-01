import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import * as Domain from "../../domain";
import { oppositeCoalition } from "../../utils";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction, transferObjectiveStructures } from "../utils";

const hasStillAliveUnits = (groundGroup: DcsJs.GroundGroup, faction: DcsJs.CampaignFaction) => {
	return groundGroup.unitIds.some((unitId) => {
		const unit = faction.inventory.groundUnits[unitId];

		return unit?.alive ?? false;
	});
};

export const conquerObjective = (
	attackingGroundGroup: DcsJs.GroundGroup,
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
) => {
	const objective = state.objectives[attackingGroundGroup.objectiveName];

	if (objective == null) {
		// eslint-disable-next-line no-console
		throw "objective not found";
		return;
	}

	attackingGroundGroup.state = "on objective";
	attackingGroundGroup.position = objective.position;
	objective.coalition = coalition;
	objective.incomingGroundGroups["blue"] = undefined;
	objective.incomingGroundGroups["red"] = undefined;

	transferObjectiveStructures(objective, coalition, state, dataStore);
};

export const g2gBattle = (
	blueGroundGroup: DcsJs.GroundGroup,
	redGroundGroup: DcsJs.GroundGroup,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
) => {
	if (Domain.Random.number(1, 100) <= 50) {
		console.log(`Ground: ${blueGroundGroup.id} destroyed ground unit from group ${redGroundGroup.id}`); // eslint-disable-line no-console

		const aliveRedUnitId = redGroundGroup.unitIds.find(
			(unitId) => state.redFaction.inventory.groundUnits[unitId]?.alive === true,
		);

		if (aliveRedUnitId == null) {
			return;
		}

		const aliveRedUnit = state.redFaction.inventory.groundUnits[aliveRedUnitId];

		if (aliveRedUnit == null) {
			return;
		}

		aliveRedUnit.alive = false;
		aliveRedUnit.destroyedTime = state.timer;
	} else {
		console.log(`Ground: ${blueGroundGroup.id} missed ground unit from group ${redGroundGroup.id}`); // eslint-disable-line no-console
	}

	if (Domain.Random.number(1, 100) <= 50) {
		console.log(`Ground: ${redGroundGroup.id} destroyed ground unit from group ${blueGroundGroup.id}`); // eslint-disable-line no-console

		const aliveBlueUnitId = blueGroundGroup.unitIds.find(
			(unitId) => state.blueFaction.inventory.groundUnits[unitId]?.alive === true,
		);

		if (aliveBlueUnitId == null) {
			return;
		}

		const aliveBlueUnit = state.blueFaction.inventory.groundUnits[aliveBlueUnitId];

		if (aliveBlueUnit == null) {
			return;
		}

		aliveBlueUnit.alive = false;
		aliveBlueUnit.destroyedTime = state.timer;
	} else {
		console.log(`Ground: ${redGroundGroup.id} missed ground unit from group ${blueGroundGroup.id}`); // eslint-disable-line no-console
	}

	const blueAlive = hasStillAliveUnits(blueGroundGroup, state.blueFaction);
	const redAlive = hasStillAliveUnits(redGroundGroup, state.redFaction);

	if (blueAlive && redAlive) {
		blueGroundGroup.combatTimer = state.timer + Domain.Time.Minutes(3);
		blueGroundGroup.state = "combat";
		redGroundGroup.combatTimer = state.timer + Domain.Time.Minutes(3);
		redGroundGroup.state = "combat";
	} else if (blueAlive) {
		conquerObjective(blueGroundGroup, "blue", state, dataStore);
	} else {
		conquerObjective(redGroundGroup, "red", state, dataStore);
	}
};

export const g2g = (
	attackingCoalition: DcsJs.CampaignCoalition,
	attackingGroundGroup: DcsJs.GroundGroup,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
) => {
	const defendingCoalition = oppositeCoalition(attackingCoalition);
	const defendingFaction = getCoalitionFaction(defendingCoalition, state);

	const defendingGroundGroup = defendingFaction.groundGroups.find(
		(gg) => gg.state === "on objective" && gg.objectiveName === attackingGroundGroup.objectiveName,
	);

	if (defendingGroundGroup == null) {
		// eslint-disable-next-line no-console
		console.error("defending ground group not found", attackingGroundGroup.objectiveName);

		conquerObjective(attackingGroundGroup, attackingCoalition, state, dataStore);

		return;
	}

	const blueGroundGroup = (
		defendingCoalition === "blue" ? defendingGroundGroup : attackingGroundGroup
	) as DcsJs.GroundGroup;
	const redGroundGroup = (
		defendingCoalition === "red" ? defendingGroundGroup : attackingGroundGroup
	) as DcsJs.GroundGroup;

	g2gBattle(blueGroundGroup, redGroundGroup, state, dataStore);
};
