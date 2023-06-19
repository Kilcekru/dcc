import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import { Config } from "../../data";
import { ObjectivePlan, Scenario } from "../../data/scenarios";
import { Position } from "../../types";
import { findNearest, onboardNumber } from "../../utils";
import { getFarthestAirdromeFromPosition, getFrontlineObjective, getLoadoutForAircraftType } from "../utils";

function getFrontlineFarp(
	objectives: Array<{ name: string; position: Position }>,
	objectivePlans: Array<ObjectivePlan>,
	frontlineObjective: DcsJs.CampaignObjective
) {
	const farps: Array<{ name: string; position: Position }> = [];

	objectivePlans.forEach((plan) => {
		const farp = plan.structures.find((str) => str.structureType === "Farp");

		if (farp) {
			const objective = objectives.find((obj) => obj.name === plan.objectiveName);

			if (objective == null) {
				// eslint-disable-next-line no-console
				console.error(`getFrontlineFarp: objective ${plan.objectiveName} not found`);

				return;
			}

			farps.push({ name: farp.structureName, position: objective.position });
		}
	});

	return findNearest(farps, frontlineObjective.position, (farp) => farp.position);
}

export const generateAircraftInventory = ({
	coalition,
	faction,
	objectives,
	scenario,
	dataStore,
}: {
	coalition: DcsJs.CampaignCoalition;
	faction: DcsJs.FactionDefinition;
	objectives: Array<{ name: string; position: Position }>;
	scenario: Scenario;
	dataStore: DataStore;
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

	const frontlineObjective = getFrontlineObjective(objectives, oppAirdromeNames, dataStore);

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

	const aircrafts: Array<DcsJs.CampaignAircraft> = [];
	const farpObjective = getFrontlineFarp(
		objectives,
		scenario[coalition === "blue" ? "blue" : "red"].objectivePlans,
		frontlineObjective
	);

	faction.aircraftTypes.awacs.forEach((acType) => {
		const count = Math.max(2, Config.inventory.aircraft.awacs * faction.aircraftTypes.cap.length);
		const aircraftType = acType as DcsJs.AircraftType;

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType,
				homeBase: {
					name: awacsAirdrome.name,
					type: "airdrome",
				},
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

		faction.aircraftTypes.cap.forEach((acType) => {
			const count = Math.max(2, Config.inventory.aircraft.cap * faction.aircraftTypes.cap.length);
			const aircraftType = acType as DcsJs.AircraftType;

			Array.from({ length: count }, () => {
				aircrafts.push({
					aircraftType,
					state: "idle",
					id: createUniqueId(),
					availableTasks: ["CAP"],
					alive: true,
					onboardNumber: onboardNumber(),
					homeBase: {
						name: airdrome.name,
						type: "airdrome",
					},
					loadout: getLoadoutForAircraftType(aircraftType, "default", dataStore),
				});
			});
		});

		faction.aircraftTypes.cas.forEach((acType) => {
			const count = Math.max(2, Config.inventory.aircraft.cas * faction.aircraftTypes.cap.length);
			const aircraft = dataStore.aircrafts?.[acType as DcsJs.AircraftType];
			const aircraftType = acType as DcsJs.AircraftType;

			Array.from({ length: count }, () => {
				aircrafts.push({
					aircraftType,
					homeBase:
						aircraft?.isHelicopter && farpObjective != null
							? {
									type: "farp",
									name: farpObjective.name,
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
					loadout: getLoadoutForAircraftType(aircraftType, "default", dataStore),
				});
			});
		});

		faction.aircraftTypes.strike.forEach((acType) => {
			const count = Math.max(2, Config.inventory.aircraft.strike * faction.aircraftTypes.strike.length);
			const aircraftType = acType as DcsJs.AircraftType;

			Array.from({ length: count }, () => {
				aircrafts.push({
					aircraftType,
					homeBase: {
						name: airdrome.name,
						type: "airdrome",
					},
					state: "idle",
					id: createUniqueId(),
					availableTasks: ["Pinpoint Strike"],
					alive: true,
					onboardNumber: onboardNumber(),
					loadout: getLoadoutForAircraftType(aircraftType, "default", dataStore),
				});
			});
		});

		faction.aircraftTypes.dead.forEach((acType) => {
			const count = Math.max(2, Config.inventory.aircraft.dead * faction.aircraftTypes.strike.length);
			const aircraftType = acType as DcsJs.AircraftType;

			Array.from({ length: count }, () => {
				aircrafts.push({
					aircraftType,
					homeBase: {
						name: airdrome.name,
						type: "airdrome",
					},
					state: "idle",
					id: createUniqueId(),
					availableTasks: ["DEAD"],
					alive: true,
					onboardNumber: onboardNumber(),
					loadout: getLoadoutForAircraftType(aircraftType, "default", dataStore),
				});
			});
		});
	});

	const aircraftRecord: Record<string, DcsJs.CampaignAircraft> = {};

	aircrafts.forEach((ac) => {
		aircraftRecord[ac.id] = ac;
	});

	return aircraftRecord;
};
