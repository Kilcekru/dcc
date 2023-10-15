import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createUniqueId } from "solid-js";

import * as Domain from "../domain";
import {
	addHeading,
	findInside,
	findNearest,
	getClientFlightGroups,
	getDurationEnRoute,
	getFlightGroups,
	oppositeCoalition,
	positionFromHeading,
} from "../utils";
import { clearPackage } from "./clearPackages";
import { getPackagesWithTarget } from "./combat/utils";
import { generateHelicoptersForHomeBase } from "./createCampaign/generateAircraftInventory";
import { RunningCampaignState } from "./types";

export const getCoalitionFaction = (coalition: DcsJs.Coalition, state: RunningCampaignState) => {
	if (coalition === "blue") {
		return state.blueFaction;
	} else {
		return state.redFaction;
	}
};

const calcNumber = (
	state: RunningCampaignState,
	base: string,
	index: number,
	number: number,
): { flightGroup: string; unit: { name: string; index: number; number: number } } => {
	const tmp = `${base}-${number}`;

	const fgs = [...getFlightGroups(state.blueFaction.packages), ...getFlightGroups(state.redFaction.packages)];

	const callSignFg = fgs.find((fg) => fg.name === tmp);

	if (callSignFg == null) {
		return {
			flightGroup: tmp,
			unit: {
				name: base,
				index,
				number,
			},
		};
	}

	return calcNumber(state, base, index, number + 1);
};

export const generateCallSign = (
	coalition: DcsJs.Coalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	type: "aircraft" | "helicopter" | "awacs",
) => {
	const { name, index } = Domain.Random.callSign(dataStore, type);

	const number = calcNumber(state, name, index, 1);

	return {
		unitCallSign: (index: number) => {
			return coalition === "blue"
				? {
						"1": number.unit.index,
						"2": number.unit.number,
						"3": index + 1,
						name: `${number.unit.name}${number.unit.number}${index + 1}`,
				  }
				: Domain.Random.number(100, 999);
		},
		unitName: (index: number) => `${number.flightGroup}-${index + 1}`,
		flightGroupName: number.flightGroup,
	};
};

const landingNavPosition = (engressPosition: DcsJs.Position, airdromePosition: DcsJs.Position) => {
	const heading = Utils.headingToPosition(engressPosition, airdromePosition);
	return positionFromHeading(airdromePosition, addHeading(heading, 180), 32000);
};

export const calcLandingWaypoints = ({
	egressPosition,
	airdromePosition,
	prevWaypointTime,
	cruiseSpeed,
}: {
	egressPosition: DcsJs.Position;
	airdromePosition: DcsJs.Position;
	prevWaypointTime: number;
	cruiseSpeed: number;
}): [Array<DcsJs.CampaignWaypoint>, number] => {
	const navPosition = landingNavPosition(egressPosition, airdromePosition);
	const durationNav = getDurationEnRoute(egressPosition, navPosition, cruiseSpeed);
	const durationLanding = getDurationEnRoute(navPosition, airdromePosition, 120);
	const endNavTime = prevWaypointTime + durationNav;
	const endLandingTime = endNavTime + 1 + durationLanding;

	return [
		[
			{
				name: "Nav",
				position: navPosition,
				speed: cruiseSpeed,
				time: endNavTime,
			},
			{
				name: "Landing",
				position: airdromePosition,
				speed: cruiseSpeed,
				time: endLandingTime,
				onGround: true,
			},
		],
		endLandingTime,
	];
};

export const calcNearestOppositeAirdrome = (
	coalition: DcsJs.Coalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
	position: DcsJs.Position,
) => {
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);
	const dataAirdromes = dataStore.airdromes;

	const airdromes = oppFaction.airdromeNames.map((name) => {
		const airdrome = dataAirdromes?.[name];

		if (airdrome == null) {
			throw Error("calcNearestOppositeAirdrome: airdrome not found");
		}

		return airdrome;
	});

	const airdrome = findNearest(airdromes, position, (ad) => ad);

	if (airdrome == null) {
		throw "undefined airdromes";
	}

	return airdrome;
};

export const unitIdsToGroundUnit = (faction: DcsJs.CampaignFaction, ids: Array<string>) => {
	return ids.reduce((prev, id) => {
		const unit = faction.inventory.groundUnits[id];

		if (unit == null) {
			return prev;
		} else {
			return [...prev, unit];
		}
	}, [] as Array<DcsJs.CampaignUnit>);
};

export function getLoadoutForAircraftType(
	aircraftType: DcsJs.AircraftType,
	task: DcsJs.Task | "default",
	dataStore: Types.Campaign.DataStore,
): DcsJs.Loadout {
	const ac = dataStore.aircrafts?.[aircraftType];

	if (ac == null) {
		throw new Error("aircraft not found: " + aircraftType);
	}

	const loadout =
		ac.loadouts.find((loadout) => loadout.task === task) ?? ac.loadouts.find((loadout) => loadout.task === "default");

	if (loadout == null) {
		// eslint-disable-next-line no-console
		console.error("getLoadoutForAircraftType", "loadout not found", ac, task);
		throw "loadout not found";
	}

	return {
		...loadout,
		task: loadout.task as DcsJs.Task,
		pylons: loadout.pylons.map((p): DcsJs.Pylon => {
			const launcher = Object.values(dataStore.launchers ?? {}).find((launcher) => p.CLSID === launcher.CLSID);
			const weapon = launcher?.type === "Weapon" ? dataStore.weapons?.[launcher.weapon] : undefined;

			if (launcher == null) {
				// eslint-disable-next-line no-console
				console.error("getLoadoutForAircraftType", "launcher not found", p);
				throw "launcher not found";
			}

			if (launcher.type === "Weapon" && weapon == null) {
				// eslint-disable-next-line no-console
				console.log("Weapon not found", launcher.weapon, dataStore.weapons);
			}

			return {
				CLSID: p.CLSID,
				num: p.num ?? 0,
				type: launcher.type,
				count: launcher.total,
				total: launcher.total,
				weapon,
			};
		}),
	};
}

export function getWeaponsForFlightGroupUnit(aircraft: DcsJs.Aircraft) {
	const weapons: Map<string, { item: DcsJs.Weapon; count: number; total: number }> = new Map();

	aircraft.loadout.pylons.forEach((pylon) => {
		if (pylon.type === "Weapon" && pylon.weapon != null) {
			const wep = weapons.get(pylon.weapon.name);

			weapons.set(pylon.weapon.name, {
				item: pylon.weapon,
				count: pylon.count + (wep?.count ?? 0),
				total: pylon.total + (wep?.total ?? 0),
			});
		}
	});

	return weapons;
}

export function getMaxRangeA2AMissileAvailable(aircraft: DcsJs.Aircraft) {
	const weapons = getWeaponsForFlightGroupUnit(aircraft);

	const availableWeapons = Array.from(weapons.values()).filter((value) => value.count > 0);
	const availableA2AWeapons = availableWeapons
		.filter(
			(weapon) =>
				weapon.item.type === "infrared" ||
				weapon.item.type === "semi-active radar" ||
				weapon.item.type === "active radar",
		)
		.map((value) => value.item as DcsJs.Weapon & DcsJs.A2AWeapon);

	return availableA2AWeapons.sort((a, b) => b.range - a.range)[0];
}

export function getFrontlineObjective(
	objectives: Array<{ position: DcsJs.Position }>,
	oppositeAirdromeNames: Array<string>,
	dataStore: Types.Campaign.DataStore,
) {
	const dataAirdromes = dataStore.airdromes;

	if (dataAirdromes == null) {
		return undefined;
	}

	const oppAirdromes = oppositeAirdromeNames.map((name) => {
		return dataAirdromes[name];
	});

	const nearestObjective = oppAirdromes.reduce(
		(prev, airdrome) => {
			if (airdrome == null) {
				throw "getFrontlineObjective: airdrome not found";
			}
			const obj = findNearest(objectives, airdrome, (obj) => obj.position);

			if (obj == null) {
				return prev;
			}

			const distance = Utils.distanceToPosition(airdrome, obj.position);

			if (distance < prev[1]) {
				return [obj, distance] as [DcsJs.Objective, number];
			} else {
				return prev;
			}
		},
		[undefined, 1000000] as [DcsJs.Objective | undefined, number],
	)[0];

	return nearestObjective;
}

export function getFarthestAirdromeFromPosition(
	position: DcsJs.Position,
	airdromeNames: Array<string>,
	dataStore: Types.Campaign.DataStore,
) {
	const dataAirdromes = dataStore.airdromes;

	if (dataAirdromes == null) {
		return undefined;
	}
	const airdromes = airdromeNames.map((name) => {
		const airdrome = dataAirdromes[name];

		if (airdrome == null) {
			throw Error("getFarthestAirdromeFromPosition: airdrome not found");
		}

		return airdrome;
	});

	const airdromesInRange = findInside(airdromes, position, (airdrome) => airdrome, 280_000);

	const [farthestAirdrome] = airdromesInRange.reduce(
		(prev, airdrome) => {
			const distance = Utils.distanceToPosition(position, airdrome);

			if (distance > prev[1]) {
				return [airdrome, distance] as [DcsJs.DCS.Airdrome, number];
			} else {
				return prev;
			}
		},
		[undefined, 0] as [DcsJs.DCS.Airdrome | undefined, number],
	);

	return farthestAirdrome;
}

export function getCoalitionObjectives(coalition: DcsJs.Coalition, state: RunningCampaignState) {
	return Object.values(state.objectives).filter((obj) => obj.coalition === coalition);
}

export function transferObjectiveStructures(
	objective: DcsJs.Objective,
	coalition: DcsJs.Coalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
) {
	const faction = getCoalitionFaction(coalition, state);
	const oppFaction = getCoalitionFaction(oppositeCoalition(coalition), state);

	const oppObjectiveStructures = Object.values(oppFaction.structures).filter(
		(str) => str.objectiveName === objective.name,
	);

	oppObjectiveStructures.forEach((structure) => {
		// Remove all packages which targets this structure
		const packages = getPackagesWithTarget(faction, structure.name);

		// eslint-disable-next-line no-console
		console.log(`transfer structures ${structure.name} to ${coalition}`);

		const clientFgs = getClientFlightGroups(packages);

		if (clientFgs.length > 0) {
			state.toastMessages.push({
				id: createUniqueId(),
				type: "info",
				description: "Strike Target was captured",
				title: "Flight Group removed",
			});
		}
		packages.forEach((pkg) => {
			clearPackage(faction, pkg);
		});

		switch (structure.type) {
			case "Barrack":
			case "Depot": {
				faction.structures[structure.name] = {
					...structure,
					id: createUniqueId(),
					deploymentScore: 0,
					buildings: structure.buildings.map((building) => ({
						...building,
						alive: true,
						destroyedTime: undefined,
					})),
				};
				break;
			}
			case "Farp": {
				faction.structures[structure.name] = {
					...structure,
					id: createUniqueId(),
				};

				const homeBase: DcsJs.CampaignHomeBase = { type: "farp", name: structure.name };

				const farpAircrafts = generateHelicoptersForHomeBase(faction, homeBase, dataStore);

				farpAircrafts.forEach((ac) => {
					faction.inventory.aircrafts[ac.id] = ac;
				});

				const oppFarpAircrafts = Object.values(oppFaction.inventory.aircrafts).filter(
					(ac) => ac.homeBase.name === structure.name,
				);

				oppFaction.packages = oppFaction.packages.filter((pkg) => {
					if (
						pkg.flightGroups.some((fg) =>
							fg.units.some((unit) => oppFarpAircrafts.some((farpUnit) => unit.id === farpUnit.id)),
						)
					) {
						return false;
					}

					return true;
				});

				oppFarpAircrafts.forEach((ac) => delete oppFaction.inventory.aircrafts[ac.id]);

				break;
			}
			default: {
				faction.structures[structure.name] = {
					...structure,
					id: createUniqueId(),
				};
			}
		}
	});

	oppObjectiveStructures.forEach((structure) => {
		delete oppFaction.structures[structure.name];
	});
}
