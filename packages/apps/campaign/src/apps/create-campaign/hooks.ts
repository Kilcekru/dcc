import * as DcsJs from "@foxdelta2/dcsjs";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { DataStore, Faction } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId, useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { DataContext } from "../../components/DataProvider";
import { factionList } from "../../data";
import { Scenario, scenarioList } from "../../data/scenarios";
import { findNearest, firstItem, objectToPosition, onboardNumber, random } from "../../utils";

export const generateVehicleInventory = (faction: Faction) => {
	const vehicleName = firstItem(faction.vehicles);

	if (vehicleName == null) {
		throw "vehicle not found";
	}

	const vehicle: DcsJs.CampaignUnit = {
		id: "",
		name: vehicleName,
		displayName: vehicleName,
		alive: true,
		category: "Armor",
		state: "idle",
		vehicleTypes: ["Armored"],
	};

	const vehicles: Array<DcsJs.CampaignUnit> = [];
	Array.from({ length: 40 }, () => {
		const id = createUniqueId();
		vehicles.push({ ...vehicle, id, displayName: `${vehicle.name}|${id}` });
	});

	return vehicles;
};
export const generateAircraftInventory = async (coalition: DcsJs.CampaignCoalition, faction: Faction) => {
	const airdromes = await getAirdromes();

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

	faction.aircraftTypes.cap.forEach((acType) => {
		const count = Math.max(2, capCount * faction.aircraftTypes.cap.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: acType as DcsJs.AircraftType,
				position: objectToPosition(airdrome),
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["CAP"],
				alive: true,
				onboardNumber: onboardNumber(),
			});
		});
	});

	faction.aircraftTypes.cas.forEach((acType) => {
		const count = Math.max(2, casCount * faction.aircraftTypes.cap.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: acType as DcsJs.AircraftType,
				position: objectToPosition(airdrome),
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
				position: objectToPosition(airdrome),
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
				position: objectToPosition(airdrome),
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
				position: objectToPosition(airdrome),
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

const getAirdromes = async () => {
	return await rpc.campaign.getAirdromes();
};

const sams = (
	coalition: DcsJs.CampaignCoalition,
	dataStore: DataStore,
	scenario: Scenario
): Array<DcsJs.CampaignSam> => {
	if (coalition === "blue" || coalition === "neutral") {
		return [];
	}

	const samTemplate = dataStore.samTemplates?.["SA-2"];
	const templateVehicles =
		samTemplate?.reduce((prev, name) => {
			const vehicle = dataStore.vehicles?.[name];

			if (vehicle == null) {
				return prev;
			}

			const unit: DcsJs.CampaignUnit = {
				alive: true,
				id: createUniqueId(),
				state: "on objective",
				displayName: vehicle.display_name,
				category: vehicle.category,
				name: vehicle.name,
				vehicleTypes: vehicle.vehicleTypes,
			};

			return [...prev, unit];
		}, [] as Array<DcsJs.CampaignUnit>) ?? [];

	if (dataStore.airdromes == null) {
		throw "Unknown strike targets";
	}

	const strikeTargets = dataStore.strikeTargets;

	if (strikeTargets == null) {
		throw "Unknown strike targets";
	}

	const airdromes = dataStore.airdromes;

	if (airdromes == null) {
		throw "Unknown airdromes";
	}

	const blueAirdromes = scenario.blue.airdromeNames.map((name) => airdromes[name as DcsJs.AirdromeName]);
	const redAirdromes = scenario.red.airdromeNames.map((name) => airdromes[name as DcsJs.AirdromeName]);

	const sams =
		strikeTargets == null
			? []
			: Object.values(strikeTargets).reduce((prev, targets) => {
					return [...prev, ...targets.filter((target) => target.type === "SAM")];
			  }, [] as Array<DcsJs.StrikeTarget>);

	const selectedSams = redAirdromes.reduce((prev, airdrome) => {
		const nearestSam = findNearest(sams, objectToPosition(airdrome), (sam) => sam.position);

		if (nearestSam == null) {
			return prev;
		} else {
			return [...prev, nearestSam];
		}
	}, [] as Array<DcsJs.StrikeTarget>);

	const firstBlueAirdrome = firstItem(blueAirdromes);

	if (firstBlueAirdrome == null) {
		throw "Unknown blue airdrome";
	}

	const selectedFrontlineSam = findNearest(sams, objectToPosition(firstBlueAirdrome), (sam) => sam.position);

	if (selectedFrontlineSam != null) {
		selectedSams.push(selectedFrontlineSam);
	}

	return selectedSams.map((sam) => {
		const objectiveTarget = Object.entries(strikeTargets).find(([, targets]) =>
			targets.some((target) => target.name === sam.name)
		);

		if (objectiveTarget == null) {
			throw "no objective target found";
		}

		return {
			id: createUniqueId(),
			position: sam.position,
			range: 45000,
			units: templateVehicles,
			operational: true,
			fireInterval: 60,
			weaponReadyTimer: 0,
			name: sam.name,
			objectiveName: objectiveTarget[0],
		};
	});
};

export const useGenerateCampaign = () => {
	const [, { activate }] = useContext(CampaignContext);
	const dataStore = useContext(DataContext);

	return async (blueFactionName: string, redFactionName: string) => {
		const scenario = firstItem(scenarioList);
		const blueBaseFaction = factionList.find((f) => f.name === blueFactionName);

		if (scenario == null) {
			throw "unknown scenario";
		}

		if (blueBaseFaction == null) {
			throw "unknown faction: " + blueFactionName;
		}

		const firstBlueAirdrome =
			dataStore.airdromes?.[(firstItem(scenario.blue.airdromeNames) ?? "") as DcsJs.AirdromeName];

		if (firstBlueAirdrome == null) {
			throw "unknown airdrome";
		}

		const nearestObjective = findNearest(
			dataStore.objectives,
			objectToPosition(firstBlueAirdrome),
			(objective) => objective.position
		);

		const blueFaction: DcsJs.CampaignFaction = {
			...blueBaseFaction,
			countryName: blueBaseFaction.countryName as DcsJs.CountryName,
			airdromeNames: scenario.blue.airdromeNames as DcsJs.AirdromeName[],
			inventory: {
				aircrafts: await generateAircraftInventory("blue", blueBaseFaction),
				vehicles: generateVehicleInventory(blueBaseFaction),
			},
			packages: [],
			sams: [],
		};

		const redBaseFaction = factionList.find((f) => f.name === redFactionName);

		if (redBaseFaction == null) {
			throw "unknown faction: " + blueFactionName;
		}

		const redFaction: DcsJs.CampaignFaction = {
			...redBaseFaction,
			countryName: redBaseFaction.countryName as DcsJs.CountryName,
			airdromeNames: scenario.red.airdromeNames as DcsJs.AirdromeName[],

			inventory: {
				aircrafts: await generateAircraftInventory("red", redBaseFaction),
				vehicles: generateVehicleInventory(redBaseFaction),
			},
			packages: [],
			sams: sams("red", dataStore, scenario),
		};

		const campaignObjectives = dataStore.objectives?.map((obj) => {
			const isBlue = nearestObjective?.name === obj.name;

			const units = isBlue
				? blueFaction.inventory.vehicles
						.filter((vehicle) => vehicle.alive && vehicle.state === "idle")
						.slice(0, random(4, 8))
				: redFaction.inventory.vehicles
						.filter((vehicle) => vehicle.alive && vehicle.state === "idle")
						.slice(0, random(4, 8));

			if (isBlue) {
				blueFaction.inventory.vehicles = blueFaction.inventory.vehicles.map((vehicle) => {
					if (units.some((unit) => unit.id === vehicle.id)) {
						return {
							...vehicle,
							state: "on objective",
						};
					} else {
						return vehicle;
					}
				});
			} else {
				redFaction.inventory.vehicles = redFaction.inventory.vehicles.map((vehicle) => {
					if (units.some((unit) => unit.id === vehicle.id)) {
						return {
							...vehicle,
							state: "on objective",
						};
					} else {
						return vehicle;
					}
				});
			}

			const structures = dataStore.strikeTargets?.[obj.name]?.filter((target) => target.type === "Structure");

			return {
				name: obj.name,
				position: obj.position,
				units:
					structures == null || structures.length < 1 ? units.map((unit) => ({ ...unit, state: "on objective" })) : [],
				structures: structures?.map((structure) => ({
					id: createUniqueId(),
					name: structure.name,
					position: structure.position,
					alive: true,
				})),
				coalition: isBlue ? "blue" : "red",
			} as DcsJs.CampaignObjective;
		});

		if (campaignObjectives == null) {
			throw "Unknown campaign objectives";
		}

		activate?.(blueFaction, redFaction, campaignObjectives, [
			...scenario.blue.farpNames.map((name) => ({ coalition: "blue" as DcsJs.CampaignCoalition, name })),
			...scenario.red.farpNames.map((name) => ({ coalition: "red" as DcsJs.CampaignCoalition, name })),
		]);
	};
};
