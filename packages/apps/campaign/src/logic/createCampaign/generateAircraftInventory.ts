import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import { Config } from "../../data";
import { Scenario } from "../../data/scenarios";
import * as Domain from "../../domain";
import { onboardNumber } from "../../utils";
import { getFarthestAirdromeFromPosition, getFrontlineObjective, getLoadoutForAircraftType } from "../utils";
import { DynamicObjectivePlan } from "./utils";

function frontlineInRange(sourcePosition: DcsJs.Position, oppObjectives: Array<DcsJs.Import.Objective>) {
	const frontlineObjectivesInRange = Domain.Location.findInside(
		oppObjectives,
		sourcePosition,
		(obj) => obj.position,
		Config.structureRange.frontline.farp,
	);

	return frontlineObjectivesInRange.length > 0;
}

function getHomeBase(
	aircraftType: DcsJs.AircraftType,
	airdromeName: string | undefined,
	carrierName: string | undefined,
	farpObjective: { name: string; position: DcsJs.Position } | undefined,
	dataStore: Types.Campaign.DataStore,
): DcsJs.CampaignHomeBase {
	const aircraft = dataStore.aircrafts?.[aircraftType];

	return aircraft?.carrierCapable && carrierName != null
		? {
				name: carrierName,
				type: "carrier",
		  }
		: aircraft?.isHelicopter && farpObjective != null
		? {
				type: "farp",
				name: farpObjective.name,
		  }
		: {
				name: airdromeName ?? "",
				type: "airdrome",
		  };
}

export const generateAircraftInventory = ({
	coalition,
	faction,
	objectivePlans,
	scenario,
	dataStore,
	carrierName,
	oppObjectives,
}: {
	coalition: DcsJs.CampaignCoalition;
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
		throw "generateAircraftInventory: AWACS Airdrome not found";
	}

	if (faction == null) {
		throw "faction not found";
	}

	const aircrafts: Array<DcsJs.Aircraft> = [];

	faction.aircraftTypes.AWACS?.forEach((acType) => {
		const count = Math.max(2, Config.inventory.aircraft.awacs * (faction.aircraftTypes.AWACS?.length ?? 0));
		const aircraftType = acType as DcsJs.AircraftType;

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType,
				homeBase: getHomeBase(aircraftType, awacsAirdrome.name, carrierName, undefined, dataStore),
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["AWACS"],
				alive: true,
				onboardNumber: onboardNumber(),
				loadout: getLoadoutForAircraftType(aircraftType, "default", dataStore),
			});
		});
	});

	airdromeNames.forEach((airdromeName) => {
		const airdrome = airdromes[airdromeName];

		if (airdrome == null) {
			throw "airdrome not found";
		}

		const isFrontlineInRange = frontlineInRange(airdrome, oppObjectives);

		faction.aircraftTypes.CAP?.forEach((acType) => {
			const count = Math.max(2, Config.inventory.aircraft.cap * (faction.aircraftTypes.CAP?.length ?? 0));
			const aircraftType = acType as DcsJs.AircraftType;

			const homeBase = getHomeBase(aircraftType, airdrome.name, carrierName, undefined, dataStore);
			const loadout = getLoadoutForAircraftType(aircraftType, "default", dataStore);

			Array.from({ length: count }, () => {
				aircrafts.push({
					aircraftType,
					state: "idle",
					id: createUniqueId(),
					availableTasks: ["CAP"],
					alive: true,
					onboardNumber: onboardNumber(),
					homeBase,
					loadout,
				});
			});
		});

		faction.aircraftTypes.CAS?.forEach((acType) => {
			const count = Math.max(2, Config.inventory.aircraft.cas * (faction.aircraftTypes.CAS?.length ?? 0));
			const aircraftType = acType as DcsJs.AircraftType;
			const aircraft = dataStore.aircrafts?.[aircraftType];

			if (aircraft?.isHelicopter && !isFrontlineInRange) {
				return;
			}

			const homeBase = getHomeBase(aircraftType, airdrome.name, carrierName, undefined, dataStore);
			const loadout = getLoadoutForAircraftType(aircraftType, "default", dataStore);

			Array.from({ length: count }, () => {
				aircrafts.push({
					aircraftType,
					homeBase,
					state: "idle",
					id: createUniqueId(),
					availableTasks: ["CAS"],
					alive: true,
					onboardNumber: onboardNumber(),
					loadout,
				});
			});
		});

		faction.aircraftTypes["Pinpoint Strike"]?.forEach((acType) => {
			const count = Math.max(
				2,
				Config.inventory.aircraft.strike * (faction.aircraftTypes["Pinpoint Strike"]?.length ?? 0),
			);
			const aircraftType = acType as DcsJs.AircraftType;
			const homeBase = getHomeBase(aircraftType, airdrome.name, carrierName, undefined, dataStore);
			const loadout = getLoadoutForAircraftType(aircraftType, "default", dataStore);

			Array.from({ length: count }, () => {
				aircrafts.push({
					aircraftType,
					homeBase,
					state: "idle",
					id: createUniqueId(),
					availableTasks: ["Pinpoint Strike"],
					alive: true,
					onboardNumber: onboardNumber(),
					loadout,
				});
			});
		});

		faction.aircraftTypes.DEAD?.forEach((acType) => {
			const count = Math.max(2, Config.inventory.aircraft.dead * (faction.aircraftTypes.DEAD?.length ?? 0));
			const aircraftType = acType as DcsJs.AircraftType;
			const homeBase = getHomeBase(aircraftType, airdrome.name, carrierName, undefined, dataStore);
			const loadout = getLoadoutForAircraftType(aircraftType, "default", dataStore);

			Array.from({ length: count }, () => {
				aircrafts.push({
					aircraftType,
					homeBase,
					state: "idle",
					id: createUniqueId(),
					availableTasks: ["DEAD"],
					alive: true,
					onboardNumber: onboardNumber(),
					loadout,
				});
			});
		});

		faction.aircraftTypes.CSAR?.forEach((acType) => {
			const count = Math.max(2, Config.inventory.aircraft.dead * (faction.aircraftTypes.CSAR?.length ?? 0));
			const aircraftType = acType as DcsJs.AircraftType;
			const homeBase = getHomeBase(aircraftType, airdrome.name, carrierName, undefined, dataStore);
			const loadout = getLoadoutForAircraftType(aircraftType, "default", dataStore);
			const aircraft = dataStore.aircrafts?.[aircraftType];

			if (aircraft?.isHelicopter && !isFrontlineInRange) {
				return;
			}

			Array.from({ length: count }, () => {
				aircrafts.push({
					aircraftType,
					homeBase,
					state: "idle",
					id: createUniqueId(),
					availableTasks: ["CSAR"],
					alive: true,
					onboardNumber: onboardNumber(),
					loadout,
				});
			});
		});
	});

	const farps: Array<{ name: string; position: DcsJs.Position }> = [];

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
					name: str.structureName,
					position: target.position,
				});
			}
		}),
	);

	farps.forEach((farp) => {
		const isFrontlineInRange = frontlineInRange(farp.position, oppObjectives);

		if (isFrontlineInRange === false) {
			return;
		}

		faction.aircraftTypes.CAS?.forEach((acType) => {
			const count = Math.max(2, Config.inventory.aircraft.cas * (faction.aircraftTypes.CAS?.length ?? 0));
			const aircraftType = acType as DcsJs.AircraftType;
			const aircraft = dataStore.aircrafts?.[aircraftType];

			if (!aircraft?.isHelicopter) {
				return;
			}

			const homeBase = getHomeBase(aircraftType, undefined, carrierName, farp, dataStore);
			const loadout = getLoadoutForAircraftType(aircraftType, "default", dataStore);

			Array.from({ length: count }, () => {
				aircrafts.push({
					aircraftType,
					homeBase,
					state: "idle",
					id: createUniqueId(),
					availableTasks: ["CAS"],
					alive: true,
					onboardNumber: onboardNumber(),
					loadout,
				});
			});
		});

		faction.aircraftTypes.CSAR?.forEach((acType) => {
			const count = Math.max(2, Config.inventory.aircraft.cas * (faction.aircraftTypes.CSAR?.length ?? 0));
			const aircraftType = acType as DcsJs.AircraftType;
			const aircraft = dataStore.aircrafts?.[aircraftType];

			if (!aircraft?.isHelicopter) {
				return;
			}

			const homeBase = getHomeBase(aircraftType, undefined, carrierName, farp, dataStore);
			const loadout = getLoadoutForAircraftType(aircraftType, "default", dataStore);

			Array.from({ length: count }, () => {
				aircrafts.push({
					aircraftType,
					homeBase,
					state: "idle",
					id: createUniqueId(),
					availableTasks: ["CSAR"],
					alive: true,
					onboardNumber: onboardNumber(),
					loadout,
				});
			});
		});
	});

	const aircraftRecord: Record<string, DcsJs.Aircraft> = {};

	aircrafts.forEach((ac) => {
		aircraftRecord[ac.id] = ac;
	});

	return aircraftRecord;
};
