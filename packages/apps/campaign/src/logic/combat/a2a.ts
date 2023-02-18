import * as DcsJs from "@foxdelta2/dcsjs";

import { distanceToPosition, firstItem, random } from "../../utils";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction } from "../utils";

export const a2aBattle = (
	blueUnits: Array<DcsJs.CampaignAircraft>,
	redUnits: Array<DcsJs.CampaignAircraft>,
	timer: number
): [Array<DcsJs.CampaignAircraft>, Array<DcsJs.CampaignAircraft>] => {
	const afterRoundBlueUnits: Array<DcsJs.CampaignAircraft> = blueUnits;
	const afterRoundRedUnits: Array<DcsJs.CampaignAircraft> = redUnits;

	blueUnits
		.filter((u) => u.alive)
		.forEach((bUnit) => {
			const rUnit = firstItem(afterRoundRedUnits.filter((u) => u.alive));

			if (rUnit) {
				if (random(1, 100) <= 50) {
					console.log(`Aircraft: ${bUnit.id} destroyed aircraft ${rUnit.id}`); // eslint-disable-line no-console
					const dUnit = afterRoundRedUnits.find((u) => rUnit.id === u.id);

					if (dUnit == null) {
						return;
					}

					dUnit.alive = false;
					dUnit.destroyedTime = timer;
				} else {
					console.log(`Aircraft: ${bUnit.id} missed aircraft ${rUnit.id}`); // eslint-disable-line no-console
				}
			}
		});

	redUnits
		.filter((u) => u.alive)
		.forEach((rUnit) => {
			const bUnit = firstItem(afterRoundBlueUnits.filter((u) => u.alive));

			if (bUnit) {
				if (random(1, 100) <= 50) {
					console.log(`Aircraft: ${rUnit.id} destroyed aircraft ${bUnit.id}`); // eslint-disable-line no-console
					const dUnit = afterRoundBlueUnits.find((u) => bUnit.id === u.id);

					if (dUnit == null) {
						return;
					}

					dUnit.alive = false;
					dUnit.destroyedTime = timer;
				} else {
					console.log(`Aircraft: ${rUnit.id} missed aircraft ${bUnit.id}`); // eslint-disable-line no-console
				}
			}
		});

	if (afterRoundBlueUnits.filter((u) => u.alive).length > 0 && afterRoundRedUnits.filter((u) => u.alive).length > 0) {
		return a2aBattle(afterRoundBlueUnits, afterRoundRedUnits, timer);
	} else {
		return [afterRoundBlueUnits, afterRoundRedUnits];
	}
};

export const a2a = (state: RunningCampaignState) => {
	const blueFaction = getCoalitionFaction("blue", state);
	const redFaction = getCoalitionFaction("red", state);

	blueFaction.packages.forEach((pkg) => {
		pkg.flightGroups.forEach((fg) => {
			if (fg.startTime > state.timer) {
				return;
			}

			redFaction.packages.forEach((pkg) => {
				const oppFg = pkg.flightGroups.find(
					(oppFg) => oppFg.startTime < state.timer && distanceToPosition(fg.position, oppFg.position) <= 40_000
				);

				if (oppFg == null || oppFg.startTime > state.timer) {
					return;
				}

				const blueAircrafts = fg.units.reduce((prev, unit) => {
					const ac = blueFaction.inventory.aircrafts[unit.id];

					if (ac != null) {
						return [...prev, ac];
					} else {
						return prev;
					}
				}, [] as Array<DcsJs.CampaignAircraft>);

				const redAircrafts = oppFg.units.reduce((prev, unit) => {
					const ac = redFaction.inventory.aircrafts[unit.id];

					if (ac != null) {
						return [...prev, ac];
					} else {
						return prev;
					}
				}, [] as Array<DcsJs.CampaignAircraft>);

				const [afterBattleBlueAircrafts, afterBattleRedAircrafts] = a2aBattle(blueAircrafts, redAircrafts, state.timer);

				afterBattleBlueAircrafts
					.filter((ac) => !ac.alive)
					.forEach((aircraft) => {
						const fAircraft = blueFaction.inventory.aircrafts[aircraft.id];

						if (fAircraft == null) {
							return;
						}

						fAircraft.alive = false;
						fAircraft.destroyedTime = state.timer;
					});

				afterBattleRedAircrafts
					.filter((ac) => !ac.alive)
					.forEach((aircraft) => {
						const fAircraft = redFaction.inventory.aircrafts[aircraft.id];

						if (fAircraft == null) {
							return;
						}

						fAircraft.alive = false;
						fAircraft.destroyedTime = state.timer;
					});
			});
		});
	});
};
