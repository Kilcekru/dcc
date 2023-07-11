import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import { Config } from "../data";
import * as Domain from "../domain";
import {
	distanceToPosition,
	getDeploymentCost,
	getUsableGroundUnits,
	Minutes,
	positionAfterDurationToPosition,
	random,
	randomList,
	timerToDate,
} from "../utils";
import { conquerObjective, g2g, g2gBattle } from "./combat";
import { getFrontlineTarget } from "./targetSelection";
import { RunningCampaignState } from "./types";
import { getCoalitionFaction, transferObjectiveStructures, unitIdsToGroundUnit } from "./utils";

export const updateObjectivesCoalition = (state: RunningCampaignState) => {
	const blueFaction = state.blueFaction;
	const redFaction = state.redFaction;

	if (blueFaction == null || redFaction == null) {
		return;
	}

	Object.values(state.objectives).forEach((objective) => {
		const blueGroundGroups = blueFaction.groundGroups.filter(
			(gg) => gg.state === "on objective" && gg.objectiveName === objective.name
		);
		const redGroundGroups = redFaction.groundGroups.filter(
			(gg) => gg.state === "on objective" && gg.objectiveName === objective.name
		);

		const blueAliveUnits = blueGroundGroups.reduce((prev, gg) => {
			const units = unitIdsToGroundUnit(blueFaction, gg.unitIds);
			const aliveUnits = units.filter((u) => u.alive);

			return [...prev, ...aliveUnits];
		}, [] as Array<DcsJs.CampaignUnit>);

		const redAliveUnits = redGroundGroups.reduce((prev, gg) => {
			const units = unitIdsToGroundUnit(redFaction, gg.unitIds);
			const aliveUnits = units.filter((u) => u.alive);

			return [...prev, ...aliveUnits];
		}, [] as Array<DcsJs.CampaignUnit>);

		const blueStructure = Object.values(blueFaction.structures).some(
			(str) => str.objectiveName === objective.name && str.buildings.some((b) => b.alive)
		);
		const redStructure = Object.values(redFaction.structures).some(
			(str) => str.objectiveName === objective.name && str.buildings.some((b) => b.alive)
		);

		if (
			blueAliveUnits.length === 0 &&
			redAliveUnits.length === 0 &&
			blueStructure === false &&
			redStructure === false
		) {
			/** TODO */
			// objective.coalition = "neutral";

			return;
		}

		if (objective.coalition === "red" && redAliveUnits.length === 0 && blueAliveUnits.length > 0) {
			objective.coalition = "blue";
		}

		if (objective.coalition === "blue" && blueAliveUnits.length === 0 && redAliveUnits.length > 0) {
			objective.coalition = "red";
		}
	});
};

type deploymentInfantry = {
	groupType: "infantry";
	barrack: DcsJs.StructureUnitCamp;
};

type deploymentArmor = {
	groupType: "armor";
	depot: DcsJs.StructureUnitCamp;
};

type deploymentSource = deploymentInfantry | deploymentArmor;

const deployFrontline = (
	p: {
		targetObjective: DcsJs.Objective;
		startObjective: DcsJs.Objective;
		state: RunningCampaignState;
	} & deploymentSource
) => {
	// Is no other ground group on the way
	if (p.targetObjective.incomingGroundGroups[p.startObjective.coalition] == null) {
		const faction = getCoalitionFaction(p.startObjective.coalition, p.state);
		const groundUnits =
			p.groupType === "infantry"
				? getUsableGroundUnits(faction.inventory.groundUnits)
				: getUsableGroundUnits(faction.inventory.groundUnits).filter(
						(unit) => !unit.vehicleTypes.some((vt) => vt === "Infantry")
				  );
		const nonSHORADUnits = groundUnits.filter((unit) => !unit.vehicleTypes.some((vt) => vt === "SHORAD"));

		const selectedGroundUnits = randomList(nonSHORADUnits, random(4, 8));

		if (selectedGroundUnits.length < 4) {
			// eslint-disable-next-line no-console
			console.warn("deployFrontline: not enough ground units available");
			return;
		}

		if (p.groupType === "armor") {
			const airDefenceUnits = Object.values(faction.inventory.groundUnits).filter(
				(unit) => unit.category === "Air Defence" && unit.state === "idle"
			);
			const count = random(0, 2);

			const selectedADUnits = airDefenceUnits.slice(0, count);

			selectedADUnits.forEach((unit) => selectedGroundUnits.push(unit));
		}

		const unitIds = selectedGroundUnits.map((u) => u.id);

		const id = createUniqueId();

		const gg: DcsJs.GroundGroup = {
			id,
			name: p.targetObjective.name + "-" + id,
			startObjectiveName: p.startObjective.name,
			objectiveName: p.targetObjective.name,
			position: p.startObjective.position,
			startTime: p.state.timer + Minutes(random(5, 15)),
			state: "en route",
			unitIds,
			type: p.groupType,
		};

		// create ground group
		faction.groundGroups.push(gg);

		// update inventory
		selectedGroundUnits.forEach((u) => {
			const inventoryUnit = faction.inventory.groundUnits[u.id];

			if (inventoryUnit == null) {
				return;
			}

			inventoryUnit.state = "on objective";
		});

		// update objective
		p.targetObjective.incomingGroundGroups[p.startObjective.coalition] = id;
		// p.startObjective.deploymentTimer = p.state.timer;
	}
};
// TODO
/* export const captureNeutralObjectives = (state: RunningCampaignState, dataStore: DataStore) => {
	
	Object.values(state.objectives).forEach((objective) => {
		if (objective.deploymentTimer + objective.deploymentDelay <= state.timer && objective.coalition !== "neutral") {
			const objectivesInRange = findInside(
				Object.values(state.objectives),
				objective.position,
				(obj) => obj.position,
				12_000
			);

			const neutralObjectives = objectivesInRange.filter((obj) => obj.coalition === "neutral");
			const vehicleObjectives = neutralObjectives.filter((obj) =>
				dataStore.strikeTargets?.[obj.name]?.some((target) => target.type === "Vehicle")
			);

			if (vehicleObjectives.length > 0) {
				const targetNeutralObjective = findNearest(vehicleObjectives, objective.position, (obj) => obj.position);

				if (targetNeutralObjective == null) {
					return;
				}

				deployFrontline(targetNeutralObjective, objective, state);
			}
		}
	});
}; */

const moveFactionGroundGroups = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore
) => {
	const faction = getCoalitionFaction(coalition, state);

	faction.groundGroups.forEach((gg) => {
		if (Domain.Faction.isGroundGroup(gg))
			if (gg.state === "en route" && gg.startTime <= state.timer) {
				const objective = state.objectives[gg.objectiveName];

				if (objective == null) {
					// eslint-disable-next-line no-console
					console.error(`objective ${gg.objectiveName} not found`);
					return;
				}

				if (distanceToPosition(gg.position, objective.position) < 2_000) {
					const objective = state.objectives[gg.objectiveName];

					if (objective == null) {
						// eslint-disable-next-line no-console
						console.error("ground group objective not found: ", gg.objectiveName);
						return;
					}

					if (objective.coalition === "neutral") {
						objective.coalition = coalition;
						objective.incomingGroundGroups[coalition] = undefined;

						gg.state = "on objective";

						transferObjectiveStructures(objective, coalition, state, dataStore);
					} else if (objective.coalition === coalition) {
						gg.state = "on objective";
						gg.position = objective.position;
						objective.incomingGroundGroups[coalition] = undefined;
					} else {
						g2g(coalition, gg, state, dataStore);
					}
				} else {
					const startObjective = state.objectives[gg.startObjectiveName];

					if (startObjective == null) {
						// eslint-disable-next-line no-console
						console.error(`objective ${gg.startObjectiveName} not found`);
						return;
					}
					gg.position = positionAfterDurationToPosition(
						startObjective.position,
						objective.position,
						state.timer - gg.startTime,
						6 // slow down on map, because the units uses the direct way.
					);
				}
			}
	});
};

const attackFrontline = (coalition: DcsJs.CampaignCoalition, state: RunningCampaignState) => {
	const faction = getCoalitionFaction(coalition, state);

	Object.keys(faction.structures).forEach((id) => {
		const structure = faction.structures[id];

		if (structure == null) {
			throw "attackFrontline: structure not found";
		}

		if (structure.type === "Depot") {
			const deploymentCost = getDeploymentCost(coalition, structure.type);

			if (structure.deploymentScore >= deploymentCost && structure.state === "active") {
				const targetObjective = getFrontlineTarget(
					coalition,
					structure.position,
					Config.structureRange.frontline.depot,
					state
				);

				if (targetObjective == null) {
					return;
				}

				const objective = state.objectives[structure.objectiveName];

				if (objective == null) {
					return;
				}

				deployFrontline({ targetObjective, startObjective: objective, state, groupType: "armor", depot: structure });
				structure.deploymentScore -= deploymentCost;
			}
		}

		if (structure.type === "Barrack") {
			const deploymentCost = getDeploymentCost(coalition, structure.type);

			if (structure.deploymentScore >= deploymentCost && structure.state === "active") {
				const targetObjective = getFrontlineTarget(
					coalition,
					structure.position,
					Config.structureRange.frontline.barrack,
					state
				);

				if (targetObjective == null) {
					return;
				}

				const objective = state.objectives[structure.objectiveName];

				if (objective == null) {
					return;
				}

				deployFrontline({
					targetObjective,
					startObjective: objective,
					state,
					groupType: "infantry",
					barrack: structure,
				});
				structure.deploymentScore -= deploymentCost;
			}
		}
	});
};

const moveFrontline = (state: RunningCampaignState, dataStore: Types.Campaign.DataStore) => {
	moveFactionGroundGroups("blue", state, dataStore);
	moveFactionGroundGroups("red", state, dataStore);
};

const updateCombat = (state: RunningCampaignState, dataStore: Types.Campaign.DataStore) => {
	state.blueFaction.groundGroups.forEach((gg) => {
		if (Domain.Faction.isGroundGroup(gg)) {
			if (gg.state === "combat" && state.timer >= (gg.combatTimer ?? 0)) {
				const redGg = state.redFaction.groundGroups.find(
					(rgg) => rgg.state === "combat" && rgg.objectiveName === gg.objectiveName
				);

				if (redGg == null || !Domain.Faction.isGroundGroup(redGg)) {
					// eslint-disable-next-line no-console
					console.error("red combat ground group not found", gg);

					conquerObjective(gg, "blue", state, dataStore);
					return;
				}

				g2gBattle(gg, redGg, state, dataStore);
			}
		}
	});
};

export const updateFrontline = (state: RunningCampaignState, dataStore: Types.Campaign.DataStore) => {
	updateObjectivesCoalition(state);
	// captureNeutralObjectives(state, dataStore); TODO

	const date = timerToDate(state.timer);
	const dayHour = date.getUTCHours() ?? 0;

	// Only create packages during the day
	if ((dayHour >= Config.night.endHour && dayHour < Config.night.startHour) || state.allowNightMissions) {
		moveFrontline(state, dataStore);
		attackFrontline("blue", state);
		attackFrontline("red", state);
		updateCombat(state, dataStore);
	}
};
