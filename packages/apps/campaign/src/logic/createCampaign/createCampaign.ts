import * as DcsJs from "@foxdelta2/dcsjs";
import { CampaignState, DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import { factionList } from "../../data";
import { scenarioList } from "../../data/scenarios";
import { firstItem, random } from "../../utils";
import { generateAircraftInventory } from "./generateAircraftInventory";
import { generateGroundUnitsInventory } from "./generateGroundUnitsInventory";
import { generateSams } from "./generateSams";

/**
 *
 * @param state will be mutated
 * @returns
 */
export const createCampaign = (
	state: CampaignState,
	dataStore: DataStore,
	blueFactionName: string,
	redFactionName: string
) => {
	const scenario = firstItem(scenarioList);
	const blueBaseFaction = factionList.find((f) => f.name === blueFactionName);

	if (scenario == null) {
		throw "unknown scenario";
	}

	if (blueBaseFaction == null) {
		throw "unknown faction: " + blueFactionName;
	}

	const firstBlueAirdrome = dataStore.airdromes?.[(firstItem(scenario.blue.airdromeNames) ?? "") as DcsJs.AirdromeName];

	if (firstBlueAirdrome == null) {
		throw "unknown airdrome";
	}

	state.blueFaction = {
		...blueBaseFaction,
		countryName: blueBaseFaction.countryName as DcsJs.CountryName,
		airdromeNames: scenario.blue.airdromeNames as DcsJs.AirdromeName[],
		inventory: {
			aircrafts: generateAircraftInventory("blue", blueBaseFaction, dataStore),
			groundUnits: generateGroundUnitsInventory(blueBaseFaction),
		},
		packages: [],
		sams: generateSams("blue", blueBaseFaction, dataStore, scenario),
		groundGroups: [],
	};

	const redBaseFaction = factionList.find((f) => f.name === redFactionName);

	if (redBaseFaction == null) {
		throw "unknown faction: " + blueFactionName;
	}

	state.redFaction = {
		...redBaseFaction,
		countryName: redBaseFaction.countryName as DcsJs.CountryName,
		airdromeNames: scenario.red.airdromeNames as DcsJs.AirdromeName[],

		inventory: {
			aircrafts: generateAircraftInventory("red", redBaseFaction, dataStore),
			groundUnits: generateGroundUnitsInventory(blueBaseFaction),
		},
		packages: [],
		sams: generateSams("red", redBaseFaction, dataStore, scenario),
		groundGroups: [],
	};

	state.objectives =
		dataStore.objectives?.reduce((prev, dataObjective) => {
			const isBlue = scenario.blue.objectiveNames.some((name) => name === dataObjective.name);
			const faction = isBlue ? state.blueFaction : state.redFaction;

			if (faction == null) {
				return prev;
			}

			const inventory = faction.inventory;
			const unitType = random(1, 100) > 40 ? "vehicle" : "infantry";
			const units = Object.values(inventory.groundUnits)
				.filter((unit) => {
					if (unitType === "infantry") {
						return unit.category === "Infantry" && unit.state === "idle";
					} else {
						return unit.category !== "Infantry" && unit.state === "idle";
					}
				})
				.slice(0, random(4, 8));

			const structures = dataStore.strikeTargets?.[dataObjective.name]?.filter((target) => target.type === "Structure");

			const isFrontlineObjective = structures == null || structures.length < 1;

			const objective = {
				name: dataObjective.name,
				position: dataObjective.position,
				structures: structures?.map((structure) => ({
					id: createUniqueId(),
					name: structure.name,
					position: structure.position,
					alive: true,
				})),
				coalition: isBlue ? "blue" : "red",
			} as DcsJs.CampaignObjective;

			if (isFrontlineObjective) {
				units.forEach((unit) => {
					const inventoryUnit = inventory.groundUnits[unit.id];

					if (inventoryUnit == null) {
						console.error("inventory ground unit not found", unit.id); // eslint-disable-line no-console
						return;
					}

					inventoryUnit.state = "on objective";
				});

				faction.groundGroups.push({
					id: createUniqueId(),
					objective,
					position: objective.position,
					state: "on objective",
					unitIds: units.map((u) => u.id),
					startTime: state.timer,
				});
			}

			return [...prev, objective];
		}, [] as Array<DcsJs.CampaignObjective>) ?? [];

	state.active = true;
	state.farps = [
		...scenario.blue.farpNames.map((name) => ({ coalition: "blue" as DcsJs.CampaignCoalition, name })),
		...scenario.red.farpNames.map((name) => ({ coalition: "red" as DcsJs.CampaignCoalition, name })),
	];

	return state;
};
