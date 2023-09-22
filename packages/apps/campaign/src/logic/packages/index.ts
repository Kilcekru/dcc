import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { Config } from "../../data";
import * as Domain from "../../domain";
import { calcFlightGroupPosition, Minutes, oppositeCoalition, random, timerToDate } from "../../utils";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction } from "../utils";
import { generateAwacsPackage } from "./awacs";
import { generateCapPackage } from "./cap";
import { generateCasPackage } from "./cas";
import { generateCsarPackage } from "./csar";
import { generateDeadPackage } from "./dead";
import { generateStrikePackage } from "./strike";

const updatePackagesState = (
	packages: Array<DcsJs.CampaignPackage>,
	lastTickTimer: number,
	timer: number,
	dataStore: Types.Campaign.DataStore,
) => {
	packages.forEach((pkg) => {
		pkg.flightGroups.forEach((fg) => {
			const position = calcFlightGroupPosition(fg, lastTickTimer, timer, dataStore);

			if (position == null) {
				return;
			}

			fg.position = position;
		});
	});
};

const getRunningPackages = (packages: Array<DcsJs.CampaignPackage>, filterFn: (pkg: DcsJs.CampaignPackage) => void) => {
	return packages.filter(filterFn);
};

const getRunningPackagesByTask = (packages: Array<DcsJs.CampaignPackage>, task: DcsJs.Task) => {
	return getRunningPackages(packages, (pkg) => pkg.task === task);
};

const addPackage = (packages: Array<DcsJs.CampaignPackage>, pkg: DcsJs.CampaignPackage | undefined) => {
	if (pkg == null) {
		return packages;
	}

	packages.push(pkg);

	return packages;
};

const casPackages = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	packages: Array<DcsJs.CampaignPackage>,
) => {
	const taskPackages = getRunningPackagesByTask(packages, "CAS");
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);
	const possibleTargets = Object.values(oppFaction.groundGroups).filter(
		(gg) =>
			gg.state === "on objective" &&
			gg.type !== "sam" &&
			gg.unitIds.filter((id) => {
				const inventoryUnit = oppFaction.inventory.groundUnits[id];

				if (inventoryUnit == null) {
					return false;
				}

				return inventoryUnit.alive;
			}).length >= 3,
	);

	const casPackageCount = Math.ceil(possibleTargets.length / 10);

	if (taskPackages.length < casPackageCount) {
		const pkg = generateCasPackage(coalition, state, dataStore);

		packages = addPackage(packages, pkg);

		if (pkg != null) {
			return true;
		}
	}

	return false;
};

const capPackages = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	packages: Array<DcsJs.CampaignPackage>,
) => {
	const faction = getCoalitionFaction(coalition, state);

	const airdromeName = faction.airdromeNames.find((airdromeName) => {
		const airdromePackages = getRunningPackages(
			faction.packages,
			(pkg) =>
				pkg.task === "CAP" &&
				pkg.flightGroups.some((fg) => {
					return fg.target === airdromeName;
				}),
		);

		return airdromePackages.length < 1;
	});

	if (airdromeName != null) {
		const pkg = generateCapPackage(coalition, state, dataStore, airdromeName);

		addPackage(packages, pkg);

		if (pkg != null) {
			return true;
		}
	} else {
		const frontlinePackages = getRunningPackages(
			faction.packages,
			(pkg) =>
				pkg.task === "CAP" &&
				pkg.flightGroups.some((fg) => {
					return fg.target === "Frontline";
				}),
		);

		if (frontlinePackages.length < 1) {
			/* const pkg = generateCapPackage(coalition, state, dataStore, "Frontline");

			addPackage(packages, pkg);

			if (pkg != null) {
				return true;
			} */
		} else {
			const ship = faction.shipGroups?.find((ship) => {
				const airdromePackages = getRunningPackages(
					faction.packages,
					(pkg) =>
						pkg.task === "CAP" &&
						pkg.flightGroups.some((fg) => {
							return fg.target === ship.name;
						}),
				);

				return airdromePackages.length < 1;
			});

			if (ship != null) {
				const pkg = generateCapPackage(coalition, state, dataStore, ship.name);

				addPackage(packages, pkg);

				if (pkg != null) {
					return true;
				}
			}
		}
	}

	return false;
};

const awacsPackages = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	packages: Array<DcsJs.CampaignPackage>,
) => {
	const taskPackages = getRunningPackagesByTask(packages, "AWACS");

	if (taskPackages.length < Config.packages.awacs) {
		const pkg = generateAwacsPackage(coalition, state, dataStore, Math.floor(state.timer) + Minutes(random(10, 15)));

		packages = addPackage(packages, pkg);
	} else if (taskPackages.length === 1) {
		const taskEndTime = taskPackages.reduce((prev, pkg) => {
			if (pkg.taskEndTime < prev) {
				return pkg.taskEndTime;
			} else {
				return prev;
			}
		}, 10000000);

		if (taskEndTime < Math.floor(state.timer) + Minutes(30)) {
			const pkg = generateAwacsPackage(coalition, state, dataStore, taskEndTime - Minutes(2));

			packages = addPackage(packages, pkg);

			if (pkg != null) {
				return true;
			}
		}
	}

	return false;
};

const deadPackages = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	packages: Array<DcsJs.CampaignPackage>,
) => {
	const taskPackages = getRunningPackagesByTask(packages, "DEAD");

	if (taskPackages.length < Config.packages.dead) {
		const pkg = generateDeadPackage(coalition, state, dataStore);

		packages = addPackage(packages, pkg);

		if (pkg != null) {
			return true;
		}
	}

	return false;
};

const strikePackages = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	packages: Array<DcsJs.CampaignPackage>,
) => {
	const taskPackages = getRunningPackagesByTask(packages, "Pinpoint Strike");
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);
	const possibleTargets = Object.values(oppFaction.structures).filter((str) => str.state !== "destroyed");

	if (possibleTargets.length === 0) {
		return false;
	}

	const strikePackageCount = Math.min(Math.ceil(possibleTargets.length / 5), Config.packages.strike);

	if (taskPackages.length < strikePackageCount) {
		const pkg = generateStrikePackage(coalition, state, dataStore);

		packages = addPackage(packages, pkg);

		if (pkg != null) {
			return true;
		}
	}

	return false;
};

const csarPackages = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	packages: Array<DcsJs.CampaignPackage>,
) => {
	const taskPackages = getRunningPackagesByTask(packages, "CSAR");
	const faction = getCoalitionFaction(coalition, state);

	if (taskPackages.length < Config.packages.csar) {
		const validDownedPilots = faction.downedPilots.filter(
			(dp) => !taskPackages.some((pkg) => pkg.flightGroups.some((fg) => fg.target === dp.id)),
		);

		const selectedDownedPilot = Domain.Utils.randomItem(validDownedPilots);

		if (selectedDownedPilot == null) {
			return;
		}

		const pkg = generateCsarPackage(coalition, state, dataStore, selectedDownedPilot);

		packages = addPackage(packages, pkg);

		if (pkg != null) {
			return true;
		}
	}

	return false;
};

const factionPackagesTick = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	faction: DcsJs.CampaignFaction,
) => {
	const date = timerToDate(state.timer);
	const dayHour = date.getUTCHours() ?? 0;

	// Only create packages during the day
	if ((dayHour >= Config.night.endHour && dayHour < Config.night.startHour) || state.allowNightMissions) {
		if (casPackages(coalition, state, dataStore, faction.packages)) {
			return;
		}
		if (capPackages(coalition, state, dataStore, faction.packages)) {
			return;
		}
		if (awacsPackages(coalition, state, dataStore, faction.packages)) {
			return;
		}
		if (deadPackages(coalition, state, dataStore, faction.packages)) {
			return;
		}
		if (strikePackages(coalition, state, dataStore, faction.packages)) {
			return;
		}
		csarPackages(coalition, state, dataStore, faction.packages);
	}
};

export const packagesRound = (state: RunningCampaignState, dataStore: Types.Campaign.DataStore) => {
	factionPackagesTick("blue", state, dataStore, state.blueFaction);
	factionPackagesTick("red", state, dataStore, state.redFaction);
};

export function updatePackagesStateRound(state: RunningCampaignState, dataStore: Types.Campaign.DataStore) {
	updatePackagesState(state.blueFaction.packages, state.lastTickTimer, state.timer, dataStore);
	updatePackagesState(state.redFaction.packages, state.lastTickTimer, state.timer, dataStore);
}
