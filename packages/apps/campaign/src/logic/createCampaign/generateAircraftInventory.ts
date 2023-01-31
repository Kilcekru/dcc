import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore, Faction } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import { Scenario } from "../../data/scenarios";
import { firstItem, getScenarioFaction, onboardNumber } from "../../utils";

export const generateAircraftInventory = (
	coalition: DcsJs.CampaignCoalition,
	faction: Faction,
	scenario: Scenario,
	dataStore: DataStore
) => {
	const airdromes = dataStore.airdromes;

	if (airdromes == null) {
		throw "airdromes not found";
	}

	const airdrome = airdromes[coalition === "blue" ? "Kobuleti" : "Mozdok"];

	const capCount = 12;
	const casCount = 4;
	const awacsCount = 3;
	const strikeCount = 6;
	const deadCount = 4;

	if (faction == null) {
		throw "faction not found";
	}

	if (airdrome == null) {
		throw "airdrome not found";
	}

	const aircrafts: Array<DcsJs.CampaignAircraft> = [];
	const farpName = firstItem(getScenarioFaction(coalition, scenario).farpNames);

	faction.aircraftTypes.cap.forEach((acType) => {
		const count = Math.max(2, capCount * faction.aircraftTypes.cap.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: acType as DcsJs.AircraftType,
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["CAP"],
				alive: true,
				onboardNumber: onboardNumber(),
				homeBase: {
					name: airdrome.name,
					type: "airdrome",
				},
			});
		});
	});

	faction.aircraftTypes.cas.forEach((acType) => {
		const count = Math.max(2, casCount * faction.aircraftTypes.cap.length);
		const aircraft = dataStore.aircrafts?.[acType as DcsJs.AircraftType];

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: acType as DcsJs.AircraftType,
				homeBase:
					aircraft?.isHelicopter && farpName != null
						? {
								type: "farp",
								name: farpName,
						  }
						: {
								type: "airdrome",
								name: airdrome.name,
						  },
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["CAS"],
				alive: true,
				onboardNumber: onboardNumber(),
			});
		});
	});

	faction.aircraftTypes.awacs.forEach((acType) => {
		const count = Math.max(2, awacsCount * faction.aircraftTypes.cap.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: acType as DcsJs.AircraftType,
				homeBase: {
					name: airdrome.name,
					type: "airdrome",
				},
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["AWACS"],
				alive: true,
				onboardNumber: onboardNumber(),
			});
		});
	});

	faction.aircraftTypes.strike.forEach((acType) => {
		const count = Math.max(2, strikeCount * faction.aircraftTypes.strike.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: acType as DcsJs.AircraftType,
				homeBase: {
					name: airdrome.name,
					type: "airdrome",
				},
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["Pinpoint Strike"],
				alive: true,
				onboardNumber: onboardNumber(),
			});
		});
	});

	faction.aircraftTypes.dead.forEach((acType) => {
		const count = Math.max(2, deadCount * faction.aircraftTypes.strike.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: acType as DcsJs.AircraftType,
				homeBase: {
					name: airdrome.name,
					type: "airdrome",
				},
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["DEAD"],
				alive: true,
				onboardNumber: onboardNumber(),
			});
		});
	});

	return aircrafts;
};
