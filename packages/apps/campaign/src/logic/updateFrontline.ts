import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import { Config } from "../data";
import {
	distanceToPosition,
	findInside,
	findNearest,
	getDeploymentCost,
	getUsableGroundUnits,
	Minutes,
	oppositeCoalition,
	positionAfterDurationToPosition,
	random,
	randomList,
} from "../utils";
import { conquerObjective, g2g, g2gBattle } from "./combat";
import { RunningCampaignState } from "./types";
import { getCoalitionFaction, unitIdsToGroundUnit } from "./utils";

export const updateObjectivesCoalition = (state: RunningCampaignState) => {
	const blueFaction = state.blueFaction;
	const redFaction = state.redFaction;

	if (blueFaction == null || redFaction == null) {
		return;
	}

	Object.values(state.objectives).forEach((objective) => {
		const blueGroundGroups = blueFaction.groundGroups.filter(
			(gg) => gg.state === "on objective" && gg.objective.name === objective.name
		);
		const redGroundGroups = redFaction.groundGroups.filter(
			(gg) => gg.state === "on objective" && gg.objective.name === objective.name
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
			objective.coalition = "neutral";

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
	barrack: DcsJs.CampaignStructureUnitCamp;
};

type deploymentArmor = {
	groupType: "armor";
	depot: DcsJs.CampaignStructureUnitCamp;
};

type deploymentSource = deploymentInfantry | deploymentArmor;

const deployFrontline = (
	p: {
		targetObjective: DcsJs.CampaignObjective;
		startObjective: DcsJs.CampaignObjective;
		state: RunningCampaignState;
	} & deploymentSource
) => {
	// Is no other ground group on the way
	if (p.targetObjective.incomingGroundGroups[p.startObjective.coalition] == null) {
		const faction = getCoalitionFaction(p.startObjective.coalition, p.state);
		const groundUnits =
			p.groupType === "infantry"
				? getUsableGroundUnits(faction.inventory.groundUnits).filter((unit) =>
						p.barrack.unitIds.some((id) => id === unit.id)
				  )
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

		const gg: DcsJs.CampaignGroundGroup = {
			id,
			startObjective: p.startObjective,
			objective: p.targetObjective,
			position: p.startObjective.position,
			startTime: p.state.timer + Minutes(random(5, 15)),
			state: "en route",
			unitIds,
			groupType: p.groupType,
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

		// update barrack
		if (p.groupType === "infantry") {
			p.barrack.unitIds = p.barrack.unitIds.filter((id) => !selectedGroundUnits.some((unit) => id === unit.id));
		}

		// update objective
		p.targetObjective.incomingGroundGroups[p.startObjective.coalition] = id;
		p.startObjective.deploymentTimer = p.state.timer;
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
	dataStore: DataStore
) => {
	const faction = getCoalitionFaction(coalition, state);

	faction.groundGroups.forEach((gg) => {
		if (gg.state === "en route" && gg.startTime <= state.timer) {
			if (distanceToPosition(gg.position, gg.objective.position) < 2_000) {
				const objective = state.objectives[gg.objective.name];

				if (objective == null) {
					// eslint-disable-next-line no-console
					console.error("ground group objective not found: ", gg.objective.name);
					return;
				}

				if (objective.coalition === "neutral") {
					objective.coalition = coalition;
					objective.incomingGroundGroups[coalition] = undefined;

					gg.state = "on objective";
				} else if (objective.coalition === coalition) {
					gg.state = "on objective";
					gg.position = objective.position;
					objective.incomingGroundGroups[coalition] = undefined;
				} else {
					g2g(coalition, gg, state, dataStore);
				}
			} else {
				gg.position = positionAfterDurationToPosition(
					gg.startObjective.position,
					gg.objective.position,
					state.timer - gg.startTime,
					6 // slow down on map, because the units uses the direct way.
				);
			}
		}
	});
};

const attackFrontline = (coalition: DcsJs.CampaignCoalition, state: RunningCampaignState, dataStore: DataStore) => {
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);
	const faction = getCoalitionFaction(coalition, state);

	const oppObjectives = Object.values(state.objectives).filter((obj) => obj.coalition === oppCoalition);

	Object.keys(faction.structures).forEach((id) => {
		const structure = faction.structures[id];

		if (structure == null) {
			throw "attackFrontline: structure not found";
		}

		if (structure.structureType === "Depot") {
			const deploymentCost = getDeploymentCost(coalition, structure.structureType);
			if (structure.deploymentScore >= deploymentCost && structure.state === "active") {
				const freeOppObjectives = oppObjectives.filter((obj) => obj.incomingGroundGroups[coalition] == null);
				const objectivesInRange = findInside(
					freeOppObjectives,
					structure.position,
					(obj) => obj.position,
					Config.structureRange.frontline.depot
				);

				const validObjectives = objectivesInRange.filter((obj) => {
					return (
						Object.values(oppFaction.structures).some((structure) => structure.objectiveName === obj.name) ||
						oppFaction.groundGroups.some((gg) => gg.objective.name === obj.name)
					);
				});

				if (validObjectives.length > 0) {
					const targetObjective = findNearest(validObjectives, structure.position, (obj) => obj.position);

					if (targetObjective == null) {
						return;
					}

					const objective = state.objectives[structure.objectiveName];

					// console.log("deploy vehicle", { source: objective, structure });

					if (objective == null) {
						// eslint-disable-next-line no-console
						console.warn("attackFrontline: source objective not found");
						return;
					}

					deployFrontline({ targetObjective, startObjective: objective, state, groupType: "armor", depot: structure });
					structure.deploymentScore -= deploymentCost;
				}
			}
		}

		if (structure.structureType === "Barrack") {
			const deploymentCost = getDeploymentCost(coalition, structure.structureType);

			if (structure.deploymentScore >= deploymentCost && structure.state === "active") {
				const oppObjectives = Object.values(state.objectives).filter((obj) => obj.coalition === oppCoalition);
				const freeOppObjectives = oppObjectives.filter((obj) => obj.incomingGroundGroups[coalition] == null);
				const objectivesInRange = findInside(
					freeOppObjectives,
					structure.position,
					(obj) => obj.position,
					Config.structureRange.frontline.barrack
				);

				const vehicleObjectives = objectivesInRange.filter((obj) =>
					dataStore.strikeTargets?.[obj.name]?.some((target) => target.type === "Vehicle")
				);

				if (vehicleObjectives.length > 0) {
					const targetObjective = findNearest(vehicleObjectives, structure.position, (obj) => obj.position);

					if (targetObjective == null) {
						return;
					}

					const objective = state.objectives[structure.objectiveName];

					// console.log("deploy infantry", { source: objective, structure });

					if (objective == null) {
						// eslint-disable-next-line no-console
						console.warn("attackFrontline: source objective not found");
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
		}
	});
};

const moveFrontline = (state: RunningCampaignState, dataStore: DataStore) => {
	moveFactionGroundGroups("blue", state, dataStore);
	moveFactionGroundGroups("red", state, dataStore);
};

const updateCombat = (state: RunningCampaignState, dataStore: DataStore) => {
	state.blueFaction.groundGroups.forEach((gg) => {
		if (gg.state === "combat" && state.timer >= (gg.combatTimer ?? 0)) {
			const redGg = state.redFaction.groundGroups.find(
				(rgg) => rgg.state === "combat" && rgg.objective.name === gg.objective.name
			);

			if (redGg == null) {
				// eslint-disable-next-line no-console
				console.error("red combat ground group not found", gg);

				conquerObjective(gg, "blue", state, dataStore);
				return;
			}

			g2gBattle(gg, redGg, state, dataStore);
		}
	});
};

export const updateFrontline = (state: RunningCampaignState, dataStore: DataStore) => {
	updateObjectivesCoalition(state);
	// captureNeutralObjectives(state, dataStore); TODO
	moveFrontline(state, dataStore);
	attackFrontline("blue", state, dataStore);
	attackFrontline("red", state, dataStore);
	updateCombat(state, dataStore);
};
