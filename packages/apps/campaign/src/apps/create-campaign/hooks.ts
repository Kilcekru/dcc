import * as DcsJs from "@foxdelta2/dcsjs";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { Faction } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId, useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { factionList } from "../../data";
import { extractPosition, findNearest, firstItem, random } from "../../utils";

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
	Array.from({ length: 40 }, () => vehicles.push({ ...vehicle, id: createUniqueId() }));

	return vehicles;
};
export const generateAircraftInventory = async (coalition: DcsJs.CampaignCoalition, faction: Faction) => {
	const airdromes = await getAirdromes();

	const airdrome = airdromes[coalition === "blue" ? "Kobuleti" : "Mozdok"];

	const capCount = 8;
	const casCount = 4;
	const awacsCount = 2;
	const strikeCount = 6;
	const deadCount = 2;

	if (faction == null) {
		throw "faction not found";
	}

	if (airdrome == null) {
		throw "airdrome not found";
	}

	const aircrafts: Array<DcsJs.CampaignAircraft> = [];

	faction.cap.forEach((acType) => {
		const count = Math.min(2, capCount * faction.cap.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: acType as DcsJs.AircraftType,
				position: extractPosition(airdrome),
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["CAP"],
				alive: true,
			});
		});
	});

	faction.cas.forEach((acType) => {
		const count = Math.min(2, casCount * faction.cap.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: acType as DcsJs.AircraftType,
				position: extractPosition(airdrome),
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["CAS"],
				alive: true,
			});
		});
	});

	faction.awacs.forEach((acType) => {
		const count = Math.min(2, awacsCount * faction.cap.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: acType as DcsJs.AircraftType,
				position: extractPosition(airdrome),
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["AWACS"],
				alive: true,
			});
		});
	});

	faction.strike.forEach((acType) => {
		const count = Math.min(2, strikeCount * faction.strike.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: acType as DcsJs.AircraftType,
				position: extractPosition(airdrome),
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["Pinpoint Strike"],
				alive: true,
			});
		});
	});

	faction.dead.forEach((acType) => {
		const count = Math.min(2, deadCount * faction.strike.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: acType as DcsJs.AircraftType,
				position: extractPosition(airdrome),
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["DEAD"],
				alive: true,
			});
		});
	});

	return aircrafts;
};

const getObjectives = async () => {
	return await rpc.campaign.getObjectives();
};

const getStrikeTargets = async () => {
	return await rpc.campaign.getStrikeTargets();
};

const getAirdromes = async () => {
	return await rpc.campaign.getAirdromes();
};

const getVehicles = async () => {
	return await rpc.campaign.getVehicles();
};

const getSamTemplates = async () => {
	return await rpc.campaign.getSamTemplates();
};

const sams = async (coalition: DcsJs.CampaignCoalition): Promise<Array<DcsJs.CampaignSam>> => {
	if (coalition === "blue" || coalition === "neutral") {
		return [];
	}

	const airdromes = await getAirdromes();
	const strikeTargets = await getStrikeTargets();
	const samTemplates = await getSamTemplates();
	const vehicles = await getVehicles();
	const kobuleti = airdromes["Kobuleti"];
	const sukhumi = airdromes["Sukhumi-Babushara"];
	const mozdok = airdromes["Mozdok"];
	const samTemplate = samTemplates["SA-2"];
	const templateVehicles =
		samTemplate?.reduce((prev, name) => {
			const vehicle = vehicles[name];

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

	const redAirdromeNames = [sukhumi.name, mozdok.name];
	const redAirdromes = redAirdromeNames.map((name) => airdromes[name]);

	const sams =
		strikeTargets == null
			? []
			: Object.values(strikeTargets).reduce((prev, targets) => {
					return [...prev, ...targets.filter((target) => target.type === "SAM")];
			  }, [] as Array<DcsJs.StrikeTarget>);

	const selectedSams = redAirdromes.reduce((prev, airdrome) => {
		const nearestSam = findNearest(sams, extractPosition(airdrome), (sam) => sam.position);

		if (nearestSam == null) {
			return prev;
		} else {
			return [...prev, nearestSam];
		}
	}, [] as Array<DcsJs.StrikeTarget>);

	const selectedFrontlineSam = findNearest(sams, extractPosition(kobuleti), (sam) => sam.position);

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

	return async (blueFactionName: string, redFactionName: string) => {
		const objectives = await getObjectives();
		const strikeTargets = await getStrikeTargets();
		const airdromes = await getAirdromes();
		const blueBaseFaction = factionList.find((f) => f.name === blueFactionName);
		const kobuleti = airdromes["Kobuleti"];
		const sukhumi = airdromes["Sukhumi-Babushara"];
		const mozdok = airdromes["Mozdok"];

		if (blueBaseFaction == null) {
			throw "unknown faction: " + blueFactionName;
		}

		if (kobuleti == null || sukhumi == null || mozdok == null) {
			throw "airdrome not found";
		}

		const nearestObjective = findNearest(objectives, extractPosition(kobuleti), (objective) => objective.position);

		const blueFaction: DcsJs.CampaignFaction = {
			...blueBaseFaction,
			countryName: blueBaseFaction.countryName as DcsJs.CountryName,
			airdromeNames: ["Kobuleti"],
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

		const redAirdromeNames = [sukhumi.name, mozdok.name];

		const redFaction: DcsJs.CampaignFaction = {
			...redBaseFaction,
			countryName: redBaseFaction.countryName as DcsJs.CountryName,
			airdromeNames: redAirdromeNames,

			inventory: {
				aircrafts: await generateAircraftInventory("red", redBaseFaction),
				vehicles: generateVehicleInventory(redBaseFaction),
			},
			packages: [],
			sams: await sams("red"),
		};

		const campaignObjectives = objectives.map((obj) => {
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

			const structures = strikeTargets[obj.name]?.filter((target) => target.type === "Structure");

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

		activate?.(blueFaction, redFaction, campaignObjectives);
	};
};
