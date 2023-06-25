import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";

import { Config } from "../../data";
import { calcFlightGroupPosition, Minutes, random, timerToDate } from "../../utils";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction } from "../utils";
import { generateAwacsPackage } from "./awacs";
import { generateCapPackage } from "./cap";
import { generateCasPackage } from "./cas";
import { generateDeadPackage } from "./dead";
import { generateStrikePackage } from "./strike";

const updatePackagesState = (packages: Array<DcsJs.CampaignPackage>, timer: number, dataStore: DataStore) => {
	packages.forEach((pkg) => {
		pkg.flightGroups.forEach((fg) => {
			const position = calcFlightGroupPosition(fg, timer, 170, dataStore);

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
	dataStore: DataStore,
	packages: Array<DcsJs.CampaignPackage>
) => {
	const taskPackages = getRunningPackagesByTask(packages, "CAS");

	if (taskPackages.length < 1) {
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
	dataStore: DataStore,
	packages: Array<DcsJs.CampaignPackage>
) => {
	const faction = getCoalitionFaction(coalition, state);

	const airdromeName = faction.airdromeNames.find((airdromeName) => {
		const airdromePackages = getRunningPackages(
			faction.packages,
			(pkg) =>
				pkg.task === "CAP" &&
				pkg.flightGroups.some((fg) => {
					return fg.target === airdromeName;
				})
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
				})
		);

		if (frontlinePackages.length < 1) {
			const pkg = generateCapPackage(coalition, state, dataStore, "Frontline");

			addPackage(packages, pkg);

			if (pkg != null) {
				return true;
			}
		}
	}

	return false;
};

const awacsPackages = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: DataStore,
	packages: Array<DcsJs.CampaignPackage>
) => {
	const taskPackages = getRunningPackagesByTask(packages, "AWACS");

	if (taskPackages.length < 1) {
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
	dataStore: DataStore,
	packages: Array<DcsJs.CampaignPackage>
) => {
	const taskPackages = getRunningPackagesByTask(packages, "DEAD");

	if (taskPackages.length < 1) {
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
	dataStore: DataStore,
	packages: Array<DcsJs.CampaignPackage>
) => {
	const taskPackages = getRunningPackagesByTask(packages, "Pinpoint Strike");

	// Penalty for red
	if (taskPackages.length < (coalition === "blue" ? 2 : 1)) {
		const pkg = generateStrikePackage(coalition, state, dataStore);

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
	dataStore: DataStore,
	faction: DcsJs.CampaignFaction
) => {
	updatePackagesState(faction.packages, state.timer, dataStore);

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
		strikePackages(coalition, state, dataStore, faction.packages);
	}
};

export const packagesRound = (state: RunningCampaignState, dataStore: DataStore) => {
	factionPackagesTick("blue", state, dataStore, state.blueFaction);
	factionPackagesTick("red", state, dataStore, state.redFaction);
};
