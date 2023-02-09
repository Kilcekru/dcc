import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import {
	distanceToPosition,
	findInside,
	findNearest,
	getUsableGroundUnits,
	Minutes,
	positionAfterDurationToPosition,
	random,
} from "../utils";
import { g2g } from "./combat";
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

		if (blueAliveUnits.length === 0 && redAliveUnits.length === 0 && objective.structures.length === 0) {
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

export const deployFrontline = (state: RunningCampaignState, dataStore: DataStore) => {
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

				// Is no other ground group on the way
				if (targetNeutralObjective.incomingGroundGroups[objective.coalition] == null) {
					const faction = getCoalitionFaction(objective.coalition, state);

					const groupType = random(1, 100) > 40 ? "armor" : "infantry";

					const availableGroundUnits = getUsableGroundUnits(faction.inventory.groundUnits)
						.filter((unit) => unit.category !== "Air Defence")
						.filter((unit) => {
							if (groupType === "infantry") {
								return unit.category === "Infantry" && unit.state === "idle";
							} else {
								return unit.category !== "Infantry" && unit.state === "idle";
							}
						})
						.slice(0, random(4, 8));

					if (availableGroundUnits.length < 4) {
						return;
					}

					const selectedUnits = availableGroundUnits.slice(0, random(4, 8));

					if (groupType === "armor") {
						const airDefenceUnits = Object.values(faction.inventory.groundUnits).filter(
							(unit) => unit.category === "Air Defence" && unit.state === "idle"
						);
						const count = random(0, 2);

						const selectedADUnits = airDefenceUnits.slice(0, count);

						selectedADUnits.forEach((unit) => selectedUnits.push(unit));
					}

					const unitIds = selectedUnits.map((u) => u.id);

					const id = createUniqueId();

					// create ground group
					faction.groundGroups.push({
						id,
						startObjective: objective,
						objective: targetNeutralObjective,
						position: objective.position,
						startTime: state.timer + Minutes(random(15, 25)),
						state: "en route",
						unitIds,
						groupType,
					});

					// update inventory
					selectedUnits.forEach((u) => {
						const inventoryUnit = faction.inventory.groundUnits[u.id];

						if (inventoryUnit == null) {
							return;
						}

						inventoryUnit.state = "on objective";
					});

					// update objective
					targetNeutralObjective.incomingGroundGroups[objective.coalition] = id;
					objective.deploymentTimer = state.timer;
				}
			}
		}
	});
};

const moveFactionGroundGroups = (coalition: DcsJs.CampaignCoalition, state: RunningCampaignState) => {
	const faction = getCoalitionFaction(coalition, state);

	faction.groundGroups.forEach((gg) => {
		if (gg.state === "en route") {
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
					// eslint-disable-next-line no-console
					console.error("ground groups conflict on objective: ", objective.name);
				} else {
					g2g(coalition, gg, state);
				}
			} else {
				gg.position = positionAfterDurationToPosition(
					gg.startObjective.position,
					gg.objective.position,
					state.timer - gg.startTime,
					10
				);
			}
		}
	});
};
export const moveFrontline = (state: RunningCampaignState) => {
	moveFactionGroundGroups("blue", state);
	moveFactionGroundGroups("red", state);
};

export const updateFrontline = (state: RunningCampaignState, dataStore: DataStore) => {
	updateObjectivesCoalition(state);
	deployFrontline(state, dataStore);
	moveFrontline(state);
};
