import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createUniqueId } from "solid-js";

import { Config } from "../data";
import * as Domain from "../domain";
import { getDeploymentCost, Minutes, positionAfterDurationToPosition, random, timerToDate } from "../utils";
import { conquerObjective, g2g, g2gBattle } from "./combat";
import { generateGroundGroupInventory } from "./createCampaign/generateGroundUnitsInventory";
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
			(gg) => gg.state === "on objective" && gg.objectiveName === objective.name,
		);
		const redGroundGroups = redFaction.groundGroups.filter(
			(gg) => gg.state === "on objective" && gg.objectiveName === objective.name,
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
			(str) => str.objectiveName === objective.name && str.buildings.some((b) => b.alive),
		);
		const redStructure = Object.values(redFaction.structures).some(
			(str) => str.objectiveName === objective.name && str.buildings.some((b) => b.alive),
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
		dataStore: Types.Campaign.DataStore;
		onObjective?: boolean;
	} & deploymentSource,
) => {
	// Is no other ground group on the way
	if (p.targetObjective.incomingGroundGroups[p.startObjective.coalition] == null) {
		const faction = getCoalitionFaction(p.startObjective.coalition, p.state);

		const groundUnits = generateGroundGroupInventory(faction, p.dataStore, p.groupType);

		const unitIds = groundUnits.map((u) => u.id);

		const id = createUniqueId();

		const gg: DcsJs.GroundGroup = {
			id,
			name: p.targetObjective.name + "-" + id,
			startObjectiveName: p.startObjective.name,
			objectiveName: p.targetObjective.name,
			position: p.onObjective ? p.targetObjective.position : p.startObjective.position,
			startTime: p.state.timer + Minutes(random(5, 15)),
			state: p.onObjective ? "on objective" : "en route",
			unitIds,
			type: p.groupType,
		};

		// create ground group
		faction.groundGroups.push(gg);

		// update inventory
		groundUnits.forEach((u) => {
			faction.inventory.groundUnits[u.id] = {
				...u,
				state: p.onObjective ? "on objective" : "en route",
			};
		});

		// update objective
		p.targetObjective.incomingGroundGroups[p.startObjective.coalition] = id;
		// p.startObjective.deploymentTimer = p.state.timer;
	}
};

const moveFactionGroundGroups = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
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

				if (Utils.distanceToPosition(gg.position, objective.position) < 2_000) {
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
						gg.position,
						objective.position,
						state.timer - state.lastTickTimer,
						6, // slow down on map, because the units uses the direct way.
					);
				}
			}
	});
};

/* const moveBackmarkers = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	relevantObjectives: Record<DcsJs.CoalitionSide, Record<string, DcsJs.Objective>>,
) => {
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppObjectives = Object.values(state.objectives).filter((obj) => obj.coalition === oppCoalition);

	faction.groundGroups.forEach((gg) => {
		if (gg.state === "on objective") {
			const oppObjectivesInRange = Domain.Location.findInside(
				oppObjectives,
				gg.position,
				(obj) => obj.position,
				Config.structureRange.frontline.depot,
			);

			if (oppObjectivesInRange.length === 0) {
				const targetObjective = getFrontlineTarget(
					coalition,
					gg.position,
					gg.type === "infantry" ? Config.structureRange.frontline.barrack : Config.structureRange.frontline.depot,
					state,
				);

				if (targetObjective == null) {
					return;
				}

				gg.name = targetObjective.name + "-" + gg.id;
				gg.startObjectiveName = gg.objectiveName;
				(gg.objectiveName = targetObjective.name), (gg.startTime = state.timer), (gg.state = "en route");

				targetObjective.incomingGroundGroups[coalition] = gg.id;

				// eslint-disable-next-line no-console
				console.log(`send backmarker ${gg.id} to ${targetObjective.name}`);
			}
		}
	});
}; */

function getUnitCamps(coalition: DcsJs.CampaignCoalition, state: RunningCampaignState) {
	const faction = getCoalitionFaction(coalition, state);
	const depotDeploymentCost = getDeploymentCost(coalition, "Depot");
	const barrackDeploymentCost = getDeploymentCost(coalition, "Barrack");
	const depots = Object.values(faction.structures).filter((structure) => {
		return structure?.type === "Depot";
	});

	const barracks = Object.values(faction.structures).filter((structure) => {
		return structure?.type === "Barrack";
	});

	const unitCamps = [...depots, ...barracks];

	const unitCampsReadyForDeployment = unitCamps.filter((camp) => {
		if (camp.state != "active") {
			return;
		}

		if (camp.type === "Depot") {
			return camp.deploymentScore >= depotDeploymentCost;
		}

		if (camp.type === "Barrack") {
			return camp.deploymentScore >= barrackDeploymentCost;
		}

		return false;
	});

	return {
		total: unitCamps,
		readyForDeployment: unitCampsReadyForDeployment,
	};
}

const attackFrontline = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	relevantObjectives: Record<DcsJs.CampaignCoalition, Record<string, DcsJs.Objective>>,
) => {
	const faction = getCoalitionFaction(coalition, state);
	const { total: unitCamps, readyForDeployment: unitCampsReadyForDeployment } = getUnitCamps(coalition, state);
	const depotDeploymentCost = getDeploymentCost(coalition, "Depot");
	const barrackDeploymentCost = getDeploymentCost(coalition, "Barrack");
	const ggsEnRoute = faction.groundGroups.filter((gg) => gg.state === "combat" || gg.state === "en route");
	const maxAllowedGg = Math.max(
		Math.round(unitCamps.length * Config.deploymentScore.maxEnRoutePerUnitCamp),
		Config.deploymentScore.maxEnRoute,
	);
	const areMoreGgsAllowed = ggsEnRoute.length < maxAllowedGg;

	if (!areMoreGgsAllowed) {
		return;
	}

	const unitCampsAtFrontline = unitCampsReadyForDeployment.filter((camp) =>
		Domain.Location.InFrontlineRange(coalition, camp.position, state),
	);

	const selectedCamp = Domain.Utils.randomItem(unitCampsAtFrontline);

	if (selectedCamp == null) {
		return;
	}

	const targetObjective = getFrontlineTarget(
		coalition,
		selectedCamp.position,
		Config.structureRange.frontline.barrack,
		state,
		relevantObjectives,
	);

	if (targetObjective == null) {
		return;
	}

	const objective = state.objectives[selectedCamp.objectiveName];

	if (objective == null) {
		return;
	}

	if (selectedCamp.type === "Depot") {
		deployFrontline({
			targetObjective,
			startObjective: objective,
			state,
			groupType: "armor",
			depot: selectedCamp,
			dataStore,
		});

		selectedCamp.deploymentScore -= barrackDeploymentCost;
	}

	if (selectedCamp.type === "Barrack") {
		deployFrontline({
			targetObjective,
			startObjective: objective,
			state,
			groupType: "infantry",
			barrack: selectedCamp,
			dataStore,
		});

		selectedCamp.deploymentScore -= depotDeploymentCost;
	}
};

export const moveGroundGroups = (state: RunningCampaignState, dataStore: Types.Campaign.DataStore) => {
	moveFactionGroundGroups("blue", state, dataStore);
	moveFactionGroundGroups("red", state, dataStore);
};

export const updateGroundCombat = (state: RunningCampaignState, dataStore: Types.Campaign.DataStore) => {
	state.blueFaction.groundGroups.forEach((gg) => {
		if (Domain.Faction.isGroundGroup(gg)) {
			if (gg.state === "combat" && state.timer >= (gg.combatTimer ?? 0)) {
				const redGg = state.redFaction.groundGroups.find(
					(rgg) => rgg.state === "combat" && rgg.objectiveName === gg.objectiveName,
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

function reinforceCoalitionFrontline(
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	frontlineObjectives: Array<DcsJs.Objective>,
) {
	const { readyForDeployment: unitCampsReadyForDeployment } = getUnitCamps(coalition, state);
	const faction = getCoalitionFaction(coalition, state);
	const depotDeploymentCost = getDeploymentCost(coalition, "Depot");
	const barrackDeploymentCost = getDeploymentCost(coalition, "Barrack");

	const emptyFrontlineObjectives = frontlineObjectives.filter((obj) => {
		if (obj.incomingGroundGroups[coalition] == null) {
			const objectiveGG = faction.groundGroups.find((gg) => gg.objectiveName === obj.name);

			return objectiveGG == null;
		}

		return false;
	});

	emptyFrontlineObjectives.forEach((obj) => {
		const campsInRange = Domain.Location.findInside(
			unitCampsReadyForDeployment,
			obj.position,
			(camp) => camp.position,
			Config.structureRange.frontline.barrack,
		);

		const farthestCamp = Domain.Location.findFarthest(campsInRange, obj.position, (camp) => camp.position);

		if (farthestCamp == null) {
			return;
		}

		const startObjective = state.objectives[farthestCamp.objectiveName];

		if (startObjective == null) {
			return;
		}

		if (farthestCamp.type === "Depot") {
			deployFrontline({
				targetObjective: obj,
				startObjective,
				state,
				groupType: "armor",
				depot: farthestCamp,
				dataStore,
				onObjective: true,
			});

			farthestCamp.deploymentScore -= barrackDeploymentCost;
		}

		if (farthestCamp.type === "Barrack") {
			deployFrontline({
				targetObjective: obj,
				startObjective,
				state,
				groupType: "infantry",
				barrack: farthestCamp,
				dataStore,
				onObjective: true,
			});

			farthestCamp.deploymentScore -= depotDeploymentCost;
		}
	});
}
function reinforceFrontline(
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	relevantObjectives: Record<DcsJs.CampaignCoalition, Record<string, DcsJs.Objective>>,
) {
	reinforceCoalitionFrontline("blue", state, dataStore, Object.values(relevantObjectives.blue));
	reinforceCoalitionFrontline("red", state, dataStore, Object.values(relevantObjectives.red));
}

export const updateFrontline = (state: RunningCampaignState, dataStore: Types.Campaign.DataStore) => {
	updateObjectivesCoalition(state);
	// captureNeutralObjectives(state, dataStore); TODO

	const date = timerToDate(state.timer);
	const dayHour = date.getUTCHours() ?? 0;

	const blueObjectives: Array<DcsJs.Objective> = [];
	const redObjectives: Array<DcsJs.Objective> = [];

	const relevantObjectives: Record<DcsJs.CampaignCoalition, Record<string, DcsJs.Objective>> = {
		blue: {},
		red: {},
		neutral: {},
	};

	Object.values(state.objectives).forEach(function objectiveCoalitionAllocation(obj) {
		if (obj.coalition === "blue") {
			blueObjectives.push(obj);
		} else if (obj.coalition === "red") {
			redObjectives.push(obj);
		}
	});

	blueObjectives.forEach(function relevantObjectivesAllocation(obj) {
		const redInRange = Domain.Location.findInside(
			redObjectives,
			obj.position,
			(robj) => robj.position,
			Config.structureRange.frontline.farp,
		);

		if (redInRange.length > 0) {
			relevantObjectives.blue[obj.name] = obj;

			redInRange.forEach((redObj) => {
				const redRelevantObjective = relevantObjectives.red[redObj.name];

				if (redRelevantObjective == null) {
					relevantObjectives.red[redObj.name] = redObj;
				}
			});
		}
	});

	reinforceFrontline(state, dataStore, relevantObjectives);

	// Only create packages during the day
	if ((dayHour >= Config.night.endHour && dayHour < Config.night.startHour) || state.allowNightMissions) {
		// moveBackmarkers("blue", state);
		// moveBackmarkers("red", state);

		attackFrontline("blue", state, dataStore, relevantObjectives);
		attackFrontline("red", state, dataStore, relevantObjectives);
	}
};
