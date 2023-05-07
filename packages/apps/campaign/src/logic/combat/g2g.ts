import * as DcsJs from "@foxdelta2/dcsjs";
import { createUniqueId } from "solid-js";

import { Minutes, oppositeCoalition, random } from "../../utils";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction, isCampaignStructureUnitCamp } from "../utils";

const hasStillAliveUnits = (groundGroup: DcsJs.CampaignGroundGroup, faction: DcsJs.CampaignFaction) => {
	return groundGroup.unitIds.some((unitId) => {
		const unit = faction.inventory.groundUnits[unitId];

		return unit?.alive ?? false;
	});
};

export const conquerObjective = (
	attackingGroundGroup: DcsJs.CampaignGroundGroup,
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState
) => {
	const faction = getCoalitionFaction(coalition, state);
	const oppFaction = getCoalitionFaction(oppositeCoalition(coalition), state);

	const objective = state.objectives[attackingGroundGroup.objective.name];

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

	const oppStructures = Object.values(oppFaction.structures).filter(
		(structure) => structure.objectiveName === objective.name
	);

	oppStructures.forEach((structure) => {
		if (isCampaignStructureUnitCamp(structure)) {
			faction.structures[structure.name] = {
				...structure,
				id: createUniqueId(),
				deploymentScore: 0,
				buildings: structure.buildings.map((building) => ({
					...building,
					alive: true,
					destroyedTime: undefined,
				})),
				unitIds: [],
			};
		}

		if (structure.structureType === "Farp") {
			faction.structures[structure.name] = {
				...structure,
				id: createUniqueId(),
			};

			const farpAircrafts = Object.values(faction.inventory.aircrafts).filter((ac) => ac.homeBase.type === "farp");

			farpAircrafts.forEach((ac) => {
				const inventoryAc = faction.inventory.aircrafts[ac.id];

				if (inventoryAc == null) {
					return;
				}

				inventoryAc.homeBase.name = structure.name;
			});
		}

		faction.structures[structure.name] = structure;
	});

	oppStructures.forEach((structure) => {
		delete oppFaction.structures[structure.name];
	});
};

export const g2gBattle = (
	blueGroundGroup: DcsJs.CampaignGroundGroup,
	redGroundGroup: DcsJs.CampaignGroundGroup,
	state: RunningCampaignState
) => {
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
		blueGroundGroup.combatTimer = state.timer + Minutes(3);
		blueGroundGroup.state = "combat";
		redGroundGroup.combatTimer = state.timer + Minutes(3);
		redGroundGroup.state = "combat";
	} else if (blueAlive) {
		conquerObjective(blueGroundGroup, "blue", state);
	} else {
		conquerObjective(redGroundGroup, "red", state);
	}
};

export const g2g = (
	attackingCoalition: DcsJs.CampaignCoalition,
	attackingGroundGroup: DcsJs.CampaignGroundGroup,
	state: RunningCampaignState
) => {
	const defendingCoalition = oppositeCoalition(attackingCoalition);
	const defendingFaction = getCoalitionFaction(defendingCoalition, state);

	const defendingGroundGroup = defendingFaction.groundGroups.find(
		(gg) => gg.state === "on objective" && gg.objective.name === attackingGroundGroup.objective.name
	);

	if (defendingGroundGroup == null) {
		// eslint-disable-next-line no-console
		console.error("defending ground group not found", attackingGroundGroup.objective.name);

		conquerObjective(attackingGroundGroup, attackingCoalition, state);

		return;
	}

	const blueGroundGroup = defendingCoalition === "blue" ? defendingGroundGroup : attackingGroundGroup;
	const redGroundGroup = defendingCoalition === "red" ? defendingGroundGroup : attackingGroundGroup;

	g2gBattle(blueGroundGroup, redGroundGroup, state);
};
