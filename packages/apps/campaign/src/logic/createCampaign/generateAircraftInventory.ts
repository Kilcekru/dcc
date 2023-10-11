import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import { Config } from "../../data";
import { Scenario } from "../../data/scenarios";
import { onboardNumber } from "../../utils";
import { getFarthestAirdromeFromPosition, getFrontlineObjective, getLoadoutForAircraftType } from "../utils";
import { DynamicObjectivePlan } from "./utils";

function getFarpsFromObjectivePlans(objectivePlans: Array<DynamicObjectivePlan>, dataStore: Types.Campaign.DataStore) {
	const farps: Array<DcsJs.CampaignHomeBase> = [];

	objectivePlans.forEach((op) =>
		op.structures.forEach((str) => {
			if (str.structureType === "Farp") {
				const targetObjective = dataStore.strikeTargets?.[op.objectiveName];

				if (targetObjective == null) {
					return;
				}

				const target = targetObjective.find((to) => to.name === str.structureName);

				if (target == null) {
					return;
				}

				farps.push({
					type: "farp",
					name: str.structureName,
				});
			}
		}),
	);

	return farps;
}

function generateAircraftForTask({
	task,
	homeBase,
	aircraftCategory,
	withoutCarrierCapable,
	faction,
	dataStore,
}: {
	task: DcsJs.Task;
	homeBase: DcsJs.CampaignHomeBase;
	aircraftCategory: "plane" | "helicopter" | "both";
	withoutCarrierCapable: boolean;
	faction: DcsJs.Faction;
	dataStore: Types.Campaign.DataStore;
}) {
	const aircrafts: Array<DcsJs.Aircraft> = [];

	faction.aircraftTypes[task]?.forEach((acType) => {
		const count = Math.max(2, Config.inventory.aircraft[task] / (faction.aircraftTypes[task]?.length ?? 0));
		const aircraftType = acType as DcsJs.AircraftType;
		const aircraft = dataStore.aircrafts?.[aircraftType];

		if (aircraft?.isHelicopter && aircraftCategory === "plane") {
			return;
		}

		if (!aircraft?.isHelicopter && aircraftCategory === "helicopter") {
			return;
		}

		if (aircraft?.carrierCapable && withoutCarrierCapable) {
			return;
		}

		const loadout = getLoadoutForAircraftType(aircraftType, "default", dataStore);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType,
				homeBase,
				state: "idle",
				id: createUniqueId(),
				availableTasks: [task],
				alive: true,
				onboardNumber: onboardNumber(),
				loadout,
			});
		});
	});

	return aircrafts;
}

export function generateHelicoptersForHomeBase(
	faction: DcsJs.Faction,
	homeBase: DcsJs.CampaignHomeBase,
	dataStore: Types.Campaign.DataStore,
) {
	const aircrafts: Array<DcsJs.Aircraft> = [
		...generateAircraftForTask({
			task: "CAS",
			homeBase,
			aircraftCategory: "helicopter",
			withoutCarrierCapable: false,
			faction,
			dataStore,
		}),
		...generateAircraftForTask({
			task: "CSAR",
			homeBase,
			aircraftCategory: "helicopter",
			withoutCarrierCapable: false,
			faction,
			dataStore,
		}),
	];

	return aircrafts;
}

export function generateAircraftsForHomeBase(
	faction: DcsJs.Faction,
	homeBase: DcsJs.CampaignHomeBase,
	dataStore: Types.Campaign.DataStore,
	withoutCarrierCapable: boolean,
) {
	const aircrafts = [
		...generateAircraftForTask({
			task: "CAP",
			aircraftCategory: "both",
			dataStore,
			faction,
			homeBase,
			withoutCarrierCapable,
		}),
		...generateAircraftForTask({
			task: "CAS",
			aircraftCategory: "both",
			dataStore,
			faction,
			homeBase,
			withoutCarrierCapable,
		}),
		...generateAircraftForTask({
			task: "Pinpoint Strike",
			aircraftCategory: "both",
			dataStore,
			faction,
			homeBase,
			withoutCarrierCapable,
		}),
		...generateAircraftForTask({
			task: "DEAD",
			aircraftCategory: "both",
			dataStore,
			faction,
			homeBase,
			withoutCarrierCapable,
		}),
		...generateAircraftForTask({
			task: "CSAR",
			aircraftCategory: "both",
			dataStore,
			faction,
			homeBase,
			withoutCarrierCapable,
		}),
	];

	return aircrafts;
}

export const generateAircraftInventory = ({
	coalition,
	faction,
	objectivePlans,
	scenario,
	dataStore,
	carrierName,
}: {
	coalition: DcsJs.Coalition;
	faction: DcsJs.Faction;
	objectivePlans: Array<DynamicObjectivePlan>;
	scenario: Scenario;
	dataStore: Types.Campaign.DataStore;
	carrierName?: string;
	oppObjectives: Array<DcsJs.Import.Objective>;
}) => {
	const airdromes = dataStore.airdromes;
	const airdromeNames: Array<DcsJs.AirdromeName> = (
		coalition === "blue" ? scenario.blue.airdromeNames : scenario.red.airdromeNames
	) as Array<DcsJs.AirdromeName>;
	const oppAirdromeNames: Array<DcsJs.AirdromeName> = (
		coalition === "blue" ? scenario.red.airdromeNames : scenario.blue.airdromeNames
	) as Array<DcsJs.AirdromeName>;

	if (airdromes == null) {
		throw "airdromes not found";
	}

	const frontlineObjective = getFrontlineObjective(
		objectivePlans.map((op) => op.objective),
		oppAirdromeNames,
		dataStore,
	);

	if (frontlineObjective == null) {
		throw `generateAircraftInventory: Frontline Objective not found: ${String(oppAirdromeNames)}`;
	}
	const awacsAirdrome = getFarthestAirdromeFromPosition(frontlineObjective.position, airdromeNames, dataStore);

	if (awacsAirdrome == null) {
		throw new Error("generateAircraftInventory: AWACS Airdrome not found");
	}

	if (faction == null) {
		throw new Error("faction not found");
	}

	const awacsHomeBase: DcsJs.CampaignHomeBase = { type: "airdrome", name: awacsAirdrome.name };

	let aircrafts: Array<DcsJs.Aircraft> = [
		...generateAircraftForTask({
			task: "AWACS",
			homeBase: awacsHomeBase,
			aircraftCategory: "plane",
			dataStore,
			faction,
			withoutCarrierCapable: false,
		}),
	];

	airdromeNames.forEach((airdromeName) => {
		const homeBase: DcsJs.CampaignHomeBase = { type: "airdrome", name: airdromeName };
		aircrafts = [...aircrafts, ...generateAircraftsForHomeBase(faction, homeBase, dataStore, carrierName != null)];
	});

	if (carrierName != null) {
		const homeBase: DcsJs.CampaignHomeBase = { type: "carrier", name: carrierName };

		aircrafts = [
			...aircrafts,
			...generateAircraftForTask({
				task: "AWACS",
				aircraftCategory: "plane",
				dataStore,
				faction,
				homeBase,
				withoutCarrierCapable: false,
			}),
			...generateAircraftsForHomeBase(faction, homeBase, dataStore, false),
		];
	}

	const farps = getFarpsFromObjectivePlans(objectivePlans, dataStore);

	farps.forEach((farp) => {
		const helicopters = generateHelicoptersForHomeBase(faction, farp, dataStore);

		aircrafts = [...aircrafts, ...helicopters];
	});

	const aircraftRecord: Record<string, DcsJs.Aircraft> = {};

	aircrafts.forEach((ac) => {
		aircraftRecord[ac.id] = ac;
	});

	return aircraftRecord;
};
