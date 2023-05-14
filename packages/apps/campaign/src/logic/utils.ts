import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";

import { Position } from "../types";
import {
	addHeading,
	distanceToPosition,
	findInside,
	findNearest,
	getDurationEnRoute,
	getFlightGroups,
	headingToPosition,
	oppositeCoalition,
	positionFromHeading,
	random,
	randomCallSign,
} from "../utils";
import { RunningCampaignState } from "./types";

export const ammoDepotRange = 50_000;
export const barrackRange = 30_000;
export const depotRange = 70_000;
export const speed = 170;
export const repairScoreCost = 100_000;

export const getCoalitionFaction = (coalition: DcsJs.CampaignCoalition, state: RunningCampaignState) => {
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
	number: number
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
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: DataStore,
	type: "aircraft" | "helicopter" | "awacs"
) => {
	const { name, index } = randomCallSign(dataStore, type);

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
				: random(100, 999);
		},
		unitName: (index: number) => `${number.flightGroup}-${index + 1}`,
		flightGroupName: number.flightGroup,
	};
};

const landingNavPosition = (engressPosition: Position, airdromePosition: Position) => {
	const heading = headingToPosition(engressPosition, airdromePosition);
	return positionFromHeading(airdromePosition, addHeading(heading, 180), 32000);
};

export const calcLandingWaypoints = (
	engressPosition: Position,
	airdromePosition: Position,
	startTime: number
): [Array<DcsJs.CampaignWaypoint>, number] => {
	const navPosition = landingNavPosition(engressPosition, airdromePosition);
	const durationNav = getDurationEnRoute(engressPosition, navPosition, speed);
	const durationLanding = getDurationEnRoute(navPosition, airdromePosition, speed);
	const endNavTime = startTime + durationNav;
	const endLandingTime = endNavTime + 1 + durationLanding;

	return [
		[
			{
				name: "Nav",
				position: navPosition,
				speed,
				time: startTime,
			},
			{
				name: "Landing",
				position: airdromePosition,
				speed,
				time: endNavTime + 1,
				onGround: true,
			},
		],
		endLandingTime,
	];
};

export const calcNearestOppositeAirdrome = (
	coalition: DcsJs.CampaignCoalition,
	state: RunningCampaignState,
	dataStore: DataStore,
	position: Position
) => {
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);
	const airdromes = oppFaction.airdromeNames.map((name) => {
		if (dataStore.airdromes == null) {
			throw "undefined airdromes";
		}
		return dataStore.airdromes?.[name];
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

export function isCampaignStructureUnitCamp(
	structure: DcsJs.CampaignStructure | undefined
): structure is DcsJs.CampaignStructureUnitCamp {
	return (structure as DcsJs.CampaignStructureUnitCamp).unitIds != null;
}

export function getLoadoutForAircraftType(
	aircraftType: DcsJs.AircraftType,
	task: DcsJs.Task | "default",
	dataStore: DataStore
): DcsJs.CampaignFlightGroupLoadout {
	const ac = dataStore.aircrafts?.[aircraftType];

	if (ac == null) {
		throw "aircraft not found";
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
		pylons: loadout.pylons.map((p): DcsJs.CampaignPylon => {
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

export function getWeaponsForFlightGroupUnit(aircraft: DcsJs.CampaignAircraft) {
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

export function getMaxRangeA2AMissileAvailable(aircraft: DcsJs.CampaignAircraft) {
	const weapons = getWeaponsForFlightGroupUnit(aircraft);

	const availableWeapons = Array.from(weapons.values()).filter((value) => value.count > 0);
	const availableA2AWeapons = availableWeapons
		.filter(
			(weapon) =>
				weapon.item.type === "infrared" ||
				weapon.item.type === "semi-active radar" ||
				weapon.item.type === "active radar"
		)
		.map((value) => value.item as DcsJs.Weapon & DcsJs.A2AWeapon);

	return availableA2AWeapons.sort((a, b) => b.range - a.range)[0];
}

export function getFrontlineObjective(
	objectives: Array<{ position: Position }>,
	oppositeAirdromeNames: Array<DcsJs.AirdromeName>,
	dataStore: DataStore
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
			const obj = findNearest(objectives, airdrome, (obj) => obj.position);

			if (obj == null) {
				return prev;
			}

			const distance = distanceToPosition(airdrome, obj.position);

			if (distance < prev[1]) {
				return [obj, distance] as [DcsJs.CampaignObjective, number];
			} else {
				return prev;
			}
		},
		[undefined, 1000000] as [DcsJs.CampaignObjective | undefined, number]
	)[0];

	return nearestObjective;
}

export function getFarthestAirdromeFromPosition(
	position: Position,
	airdromeNames: Array<DcsJs.AirdromeName>,
	dataStore: DataStore
) {
	const dataAirdromes = dataStore.airdromes;

	if (dataAirdromes == null) {
		return undefined;
	}
	const airdromes = airdromeNames.map((name) => {
		return dataAirdromes[name];
	});

	const airdromesInRange = findInside(airdromes, position, (airdrome) => airdrome, 280_000);

	const [farthestAirdrome] = airdromesInRange.reduce(
		(prev, airdrome) => {
			const distance = distanceToPosition(position, airdrome);

			if (distance > prev[1]) {
				return [airdrome, distance] as [DcsJs.DCS.Airdrome, number];
			} else {
				return prev;
			}
		},
		[undefined, 0] as [DcsJs.DCS.Airdrome | undefined, number]
	);

	return farthestAirdrome;
}

export function getCoalitionObjectives(coalition: DcsJs.CampaignCoalition, state: RunningCampaignState) {
	return Object.values(state.objectives).filter((obj) => obj.coalition === coalition);
}
