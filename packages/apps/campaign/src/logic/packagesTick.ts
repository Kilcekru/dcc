import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";

import { calcFlightGroupPosition, getAircraftFromId } from "../utils";
import { generateAwacsPackage, generateCapPackage, generateCasPackage } from "./packages";
import { RunningCampaignState } from "./types";
import { getCoalitionFaction } from "./utils";

const updatePackagesState = (faction: DcsJs.CampaignFaction, timer: number) => {
	const cleanedFlightGroups = faction.packages.map((pkg) => {
		return {
			...pkg,
			flightGroups: pkg.flightGroups.filter((fg) => {
				const aliveAircrafts = fg.units.filter((unit) => {
					const ac = getAircraftFromId(faction.inventory.aircrafts, unit.aircraftId);

					return ac?.alive === true;
				});

				return aliveAircrafts.length > 0;
			}),
		};
	});

	const cleanedPackages = cleanedFlightGroups.filter((pkg) => pkg.flightGroups.length > 0);

	const packages = cleanedPackages.map((pkg) => {
		return {
			...pkg,
			flightGroups: pkg.flightGroups.map((fg) => {
				const position = calcFlightGroupPosition(fg, timer, 170);

				if (position == null) {
					return fg;
				}

				return {
					...fg,
					position,
				};
			}),
		};
	});

	return {
		...faction,
		packages,
	};
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
	}

	return packages;
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
					return fg.objective?.name === airdromeName;
				})
		);

		return airdromePackages.length < 1;
	});

	if (airdromeName != null) {
		const pkg = generateCapPackage(coalition, state, dataStore, airdromeName);

		packages = addPackage(packages, pkg);
	} else {
		const frontlinePackages = getRunningPackages(
			faction.packages,
			(pkg) =>
				pkg.task === "CAP" &&
				pkg.flightGroups.some((fg) => {
					return fg.objective?.name === "Frontline";
				})
		);

		if (frontlinePackages.length < 1) {
			const pkg = generateCapPackage(coalition, state, dataStore, "Frontline");

			packages = addPackage(packages, pkg);
		}
	}

	return packages;
};

const awacsPackages = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: DataStore,
	packages: Array<DcsJs.CampaignPackage>
) => {
	const taskPackages = getRunningPackagesByTask(packages, "AWACS");

	if (taskPackages.length < 1) {
		const pkg = generateAwacsPackage(coalition, state, dataStore);

		packages = addPackage(packages, pkg);
	}

	return packages;
};

const factionPackagesTick = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: DataStore,
	faction: DcsJs.CampaignFaction
) => {
	updatePackagesState(faction, state.timer);
	faction.packages = casPackages(coalition, state, dataStore, faction.packages);
	faction.packages = capPackages(coalition, state, dataStore, faction.packages);
	faction.packages = awacsPackages(coalition, state, dataStore, faction.packages);

	return faction;
};

export const packagesTick = (state: RunningCampaignState, dataStore: DataStore) => {
	state.blueFaction = factionPackagesTick("blue", state, dataStore, state.blueFaction);
	state.redFaction = factionPackagesTick("red", state, dataStore, state.redFaction);

	return state;
};
