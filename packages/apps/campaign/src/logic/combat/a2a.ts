import * as DcsJs from "@foxdelta2/dcsjs";
import { createUniqueId } from "solid-js";

import { distanceToPosition, getFlightGroups, Minutes, random } from "../../utils";
import { RunningCampaignState } from "../types";
import { getMaxRangeA2AMissileAvailable } from "../utils";

type BattleReportEntry = {
	unit: DcsJs.CampaignFlightGroupUnit;
	aircraft: DcsJs.CampaignAircraft;
	weapon: DcsJs.Weapon & DcsJs.A2AWeapon;
	targetAircraft?: DcsJs.CampaignAircraft;
};

type BattleReport = Array<BattleReportEntry>;

const saveBattleReport = (
	report: BattleReport,
	faction: DcsJs.CampaignFaction,
	targetFaction: DcsJs.CampaignFaction,
	timer: number
) => {
	if (report.length > 0) {
		report.forEach((entry) => {
			const aircraft = faction.inventory.aircrafts[entry.aircraft.id];

			if (aircraft == null) {
				throw "aircraft not found";
			}

			aircraft.a2AWeaponReadyTimer = timer + Minutes(1);
			const pylon = aircraft.loadout.pylons.find((p) => p.weapon?.name === entry.weapon.name && p.count > 0);

			if (pylon == null) {
				// eslint-disable-next-line no-console
				console.error("saveBattleReport", "pylon not found", aircraft, entry.weapon, report);
				return;
			}

			pylon.count -= 1;

			if (entry.targetAircraft == null) {
				// eslint-disable-next-line no-console
				console.log(`${aircraft.aircraftType}(${aircraft.id}) missed with ${entry.weapon.name}`);
				return;
			}

			const targetAircraft = targetFaction.inventory.aircrafts[entry.targetAircraft.id];

			if (targetAircraft == null) {
				throw "target aircraft not found";
			}

			// eslint-disable-next-line no-console
			console.log(
				`${aircraft.aircraftType}(${aircraft.id}) destroyed ${targetAircraft.aircraftType}(${targetAircraft.id}) with ${entry.weapon.name}`
			);

			targetAircraft.alive = false;
			targetAircraft.destroyedTime = timer;
		});
	}
};

const a2aRound = (
	attackingFg: DcsJs.CampaignFlightGroup,
	targetFg: DcsJs.CampaignFlightGroup,
	attackingFaction: DcsJs.CampaignFaction,
	targetFaction: DcsJs.CampaignFaction,
	timer: number,
	battleReport: BattleReport
) => {
	attackingFg.units.forEach((attackingUnit) => {
		const attackingAircraft = attackingFaction.inventory.aircrafts[attackingUnit.id];

		if (
			attackingAircraft?.alive &&
			(attackingAircraft.a2AWeaponReadyTimer == null || attackingAircraft.a2AWeaponReadyTimer < timer)
		) {
			const distance = distanceToPosition(attackingFg.position, targetFg.position);
			const targetUnit = targetFg.units.find((unit) => {
				const targetAircraft = targetFaction.inventory.aircrafts[unit.id];

				if (targetAircraft?.alive) {
					const maxRangeWeapon = getMaxRangeA2AMissileAvailable(attackingAircraft);

					if (maxRangeWeapon == null) {
						return false;
					}

					if (distance <= maxRangeWeapon.range * 0.66) {
						return true;
					}
				}

				return false;
			});

			if (targetUnit == null) {
				return;
			}

			const maxRangeWeapon = getMaxRangeA2AMissileAvailable(attackingAircraft);
			const targetAircraft = targetFaction.inventory.aircrafts[targetUnit.id];

			if (maxRangeWeapon == null || targetAircraft == null) {
				return;
			}

			const entry: BattleReportEntry = {
				unit: attackingUnit,
				aircraft: attackingAircraft,
				weapon: maxRangeWeapon,
			};
			const distanceFactor = 1 - distance / maxRangeWeapon.range;

			if (random(1, 100) <= 100 * distanceFactor) {
				entry["targetAircraft"] = targetAircraft;
			}

			battleReport.push(entry);
		}
	});
};

const a2aFlightGroups = (
	attackingFgs: Array<DcsJs.CampaignFlightGroup>,
	targetFgs: Array<DcsJs.CampaignFlightGroup>,
	attackingFaction: DcsJs.CampaignFaction,
	targetFaction: DcsJs.CampaignFaction,
	timer: number
) => {
	const battleReport: BattleReport = [];

	attackingFgs.forEach((attackingFlightGroup) => {
		const targetFlightGroup = targetFgs
			.filter((fg) => distanceToPosition(attackingFlightGroup.position, fg.position) <= 177_000)
			.map((fg) => ({
				item: fg,
				distance: distanceToPosition(attackingFlightGroup.position, fg.position),
			}))
			.sort((a, b) => b.distance - a.distance)[0]?.item;

		if (targetFlightGroup == null) {
			return;
		}

		a2aRound(attackingFlightGroup, targetFlightGroup, attackingFaction, targetFaction, timer, battleReport);
	});

	return battleReport;
};

export const a2a = (state: RunningCampaignState) => {
	const blueFlightGroups = getFlightGroups(state.blueFaction.packages);
	const redFlightGroups = getFlightGroups(state.redFaction.packages);

	const flyingBlueFgs = blueFlightGroups.filter((fg) => fg.startTime < state.timer);
	const flyingRedFgs = redFlightGroups.filter((fg) => fg.startTime < state.timer);

	const blueBattleReport = a2aFlightGroups(
		flyingBlueFgs,
		flyingRedFgs,
		state.blueFaction,
		state.redFaction,
		state.timer
	);
	const redBattleReport = a2aFlightGroups(
		flyingRedFgs,
		flyingBlueFgs,
		state.redFaction,
		state.blueFaction,
		state.timer
	);

	if (blueBattleReport.length > 0) {
		saveBattleReport(blueBattleReport, state.blueFaction, state.redFaction, state.timer);
	}

	if (redBattleReport.length > 0) {
		saveBattleReport(redBattleReport, state.redFaction, state.blueFaction, state.timer);
	}

	/* if (blueBattleReport.length > 0 || redBattleReport.length > 0) {
		console.log("---Battle Report---");
		console.log(
			"Blue",
			`Shots: ${blueBattleReport.length}, Hits: ${blueBattleReport.filter((r) => r.targetAircraft != null).length}`
		);
		console.log(
			"Red",
			`Shots: ${redBattleReport.length}, Hits: ${redBattleReport.filter((r) => r.targetAircraft != null).length}`
		);
	} */
};
