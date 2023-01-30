import * as DcsJs from "@foxdelta2/dcsjs";
import { createUniqueId } from "solid-js";

import { findInside, findNearest, getUsableGroundUnits, Minutes, random } from "../utils";
import { RunningCampaignState } from "./types";
import { getCoalitionFaction, unitIdsToGroundUnit } from "./utils";

export const updateObjectivesCoalition = (state: RunningCampaignState) => {
	const blueFaction = state.blueFaction;
	const redFaction = state.redFaction;

	if (blueFaction == null || redFaction == null) {
		return;
	}

	state.objectives.forEach((objective) => {
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

export const deployFrontline = (state: RunningCampaignState) => {
	state.objectives.forEach((objective) => {
		if (objective.deploymentReadyTimer <= state.timer) {
			const objectivesInRange = findInside(state.objectives, objective.position, (obj) => obj.position, 12_000);

			const neutralObjectives = objectivesInRange.filter((obj) => obj.coalition === "neutral");

			if (neutralObjectives.length > 0) {
				const targetNeutralObjective = findNearest(neutralObjectives, objective.position, (obj) => obj.position);

				if (targetNeutralObjective == null) {
					return;
				}

				// Is no other ground group on the way
				if (targetNeutralObjective.incomingGroundGroups[objective.coalition] == null) {
					const faction = getCoalitionFaction(objective.coalition, state);

					const availableGroundUnits = getUsableGroundUnits(faction.inventory.groundUnits);

					if (availableGroundUnits.length < 4) {
						return;
					}

					const selectedUnits = availableGroundUnits.slice(0, random(4, 8));

					const unitIds = selectedUnits.map((u) => u.id);

					const id = createUniqueId();

					// create ground group
					faction.groundGroups.push({
						id,
						objective: targetNeutralObjective,
						position: objective.position,
						startTime: state.timer + Minutes(random(15, 25)),
						state: "en route",
						unitIds,
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
					objective.incomingGroundGroups[objective.coalition] = id;
					objective.deploymentReadyTimer = state.timer + Minutes(random(40, 60));
				}
			}
		}
	});
};

export const updateFrontline = (state: RunningCampaignState) => {
	updateObjectivesCoalition(state);
	deployFrontline(state);
};
