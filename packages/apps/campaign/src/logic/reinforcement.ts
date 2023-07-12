import type * as DcsJs from "@foxdelta2/dcsjs";
import { createUniqueId } from "solid-js";

import { RunningCampaignState } from "./types";
import { getCoalitionFaction } from "./utils";

export const factionReinforcement = (coalition: DcsJs.CampaignCoalition, state: RunningCampaignState) => {
	const faction = getCoalitionFaction(coalition, state);

	if (faction.reinforcementTimer + faction.reinforcementDelay <= state.timer) {
		const destroyedAircrafts = Object.values(faction.inventory.aircrafts).filter(
			(ac) => ac.alive === false && ac.destroyedTime != null && ac.destroyedTime > faction.reinforcementTimer,
		);

		destroyedAircrafts.forEach((ac) => {
			const id = createUniqueId();

			faction.inventory.aircrafts[id] = {
				...ac,
				alive: true,
				destroyedTime: undefined,
				a2GWeaponReadyTimer: undefined,
				a2AWeaponReadyTimer: undefined,
				maintenanceEndTime: undefined,
				state: "idle",
				id,
			};
		});

		// eslint-disable-next-line no-console
		console.log(`${coalition} reinforced ${destroyedAircrafts.length} aircrafts`);

		if (coalition === "blue") {
			const destroyedGroundUnits = Object.values(faction.inventory.groundUnits).filter(
				(gu) => gu.alive === false && gu.destroyedTime != null && gu.destroyedTime > faction.reinforcementTimer,
			);

			destroyedGroundUnits.forEach((gu) => {
				const id = createUniqueId();

				faction.inventory.groundUnits[id] = {
					...gu,
					alive: true,
					destroyedTime: undefined,
					state: "idle",
					id,
				};
			});

			// eslint-disable-next-line no-console
			console.log(`${coalition} reinforced ${destroyedGroundUnits.length} ground units`);
		}

		faction.reinforcementTimer = state.timer;
	}
};

export const reinforcement = (state: RunningCampaignState) => {
	factionReinforcement("blue", state);
	factionReinforcement("red", state);
};
