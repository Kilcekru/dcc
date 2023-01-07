import type * as DcsJs from "@foxdelta2/dcsjs";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { Faction } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId, useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { airdromes, factionList, Objectives } from "../../data";
import { Objective } from "../../types";
import { distanceToPosition, firstItem, random } from "../../utils";

const getAirdromes = async () => {
	return rpc.campaign.getAirdromes();
};

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
	};

	const vehicles: Array<DcsJs.CampaignUnit> = [];
	Array.from({ length: 40 }, () => vehicles.push({ ...vehicle, id: createUniqueId() }));

	return vehicles;
};
export const generateAircraftInventory = async (coalition: DcsJs.CampaignCoalition, faction: Faction) => {
	const dcsAirdromes = await getAirdromes();

	console.log({ dcsAirdromes }); // eslint-disable-line no-console
	const airdrome = airdromes.find((drome) => drome.name === (coalition === "blue" ? "Kobuleti" : "Mozdok"));

	const capCount = 8;
	const casCount = 4;
	const awacsCount = 2;

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
				position: airdrome.position,
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["CAP"],
			});
		});
	});

	faction.cas.forEach((acType) => {
		const count = Math.min(2, casCount * faction.cap.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: acType as DcsJs.AircraftType,
				position: airdrome.position,
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["CAS"],
			});
		});
	});

	faction.awacs.forEach((acType) => {
		const count = Math.min(2, awacsCount * faction.cap.length);

		Array.from({ length: count }, () => {
			aircrafts.push({
				aircraftType: acType as DcsJs.AircraftType,
				position: airdrome.position,
				state: "idle",
				id: createUniqueId(),
				availableTasks: ["AWACS"],
			});
		});
	});

	return aircrafts;
};

export const useGenerateCampaign = () => {
	const [, { activate }] = useContext(CampaignContext);

	return async (blueFactionName: string, redFactionName: string) => {
		const blueBaseFaction = factionList.find((f) => f.name === blueFactionName);
		const kobuleti = airdromes.find((drome) => drome.name === "Kobuleti");
		const sukhumi = airdromes.find((drome) => drome.name === "Sukhumi-Babushara");
		const mozdok = airdromes.find((drome) => drome.name === "Mozdok");

		if (blueBaseFaction == null) {
			throw "unknown faction: " + blueFactionName;
		}

		if (kobuleti == null || sukhumi == null || mozdok == null) {
			throw "airdrome not found";
		}

		const nearestObjective = Objectives.reduce(
			([prevObj, prevDistance], obj) => {
				const distance = distanceToPosition(kobuleti.position, obj.position);

				if (distance < prevDistance) {
					return [obj, distance] as [Objective | undefined, number];
				} else {
					return [prevObj, prevDistance] as [Objective | undefined, number];
				}
			},
			[undefined, 10000000] as [Objective | undefined, number]
		)[0];

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
		const redFaction: DcsJs.CampaignFaction = {
			...redBaseFaction,
			countryName: redBaseFaction.countryName as DcsJs.CountryName,
			airdromeNames: ["Sukhumi-Babushara", "Mozdok"],

			inventory: {
				aircrafts: await generateAircraftInventory("red", redBaseFaction),
				vehicles: generateVehicleInventory(redBaseFaction),
			},
			packages: [],
			sams: [
				{
					id: "sam-01",
					position: { x: -245830.27997983, y: 637190.53205482 },
					range: 45000,
					units: [],
				},
			],
		};

		const objectives = Objectives.map((obj) => {
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
			return {
				name: obj.name,
				position: obj.position,
				units: units.map((unit) => ({ ...unit, state: "on objective" })),
				coalition: isBlue ? "blue" : "red",
			} as DcsJs.CampaignObjective;
		});

		activate?.(blueFaction, redFaction, objectives);
	};
};
