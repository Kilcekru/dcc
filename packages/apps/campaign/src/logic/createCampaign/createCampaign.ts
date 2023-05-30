import * as DcsJs from "@foxdelta2/dcsjs";
import { CampaignState, DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import { factionList } from "../../data";
import { scenarioList } from "../../data/scenarios";
import { firstItem, getUsableUnit, Minutes, random } from "../../utils";
import { addEWs } from "./addEWs";
import { generateAircraftInventory } from "./generateAircraftInventory";
import { generateGroundUnitsInventory } from "./generateGroundUnitsInventory";
import { generateSams } from "./generateSams";
import { generateStructures } from "./generateStructures";
import { claimsObjective } from "./utils";

/**
 *
 * @param state will be mutated
 * @returns
 */
export const createCampaign = (
	state: CampaignState,
	dataStore: DataStore,
	blueFactionName: string,
	redFactionName: string,
	aiSkill: DcsJs.AiSkill,
	hardcore: boolean
) => {
	const scenario = firstItem(scenarioList);
	const blueBaseFaction = factionList.find((f) => f.name === blueFactionName);

	if (scenario == null) {
		throw "unknown scenario";
	}

	if (blueBaseFaction == null) {
		throw "unknown faction: " + blueFactionName;
	}

	const redBaseFaction = factionList.find((f) => f.name === redFactionName);

	if (redBaseFaction == null) {
		throw "unknown faction: " + blueFactionName;
	}

	const firstBlueAirdrome = dataStore.airdromes?.[(firstItem(scenario.blue.airdromeNames) ?? "") as DcsJs.AirdromeName];

	if (firstBlueAirdrome == null) {
		throw "unknown airdrome";
	}

	const blueObjectives: DataStore["objectives"] = [];
	const redObjectives: DataStore["objectives"] = [];

	dataStore.objectives?.forEach((dataObjective) => {
		const isBlue = claimsObjective(scenario.blue, dataObjective.name);
		const isRed = claimsObjective(scenario.red, dataObjective.name);

		if (isBlue) {
			blueObjectives.push(dataObjective);
		}

		if (isRed) {
			redObjectives.push(dataObjective);
		}
	});

	state.blueFaction = {
		...blueBaseFaction,
		countryName: blueBaseFaction.countryName as DcsJs.CountryName,
		airdromeNames: scenario.blue.airdromeNames as DcsJs.AirdromeName[],
		inventory: {
			aircrafts: generateAircraftInventory({
				coalition: "blue",
				faction: blueBaseFaction,
				scenario,
				dataStore,
				objectives: blueObjectives,
			}),
			groundUnits: generateGroundUnitsInventory(blueBaseFaction, "blue", scenario),
		},
		packages: [],
		sams: [], // will be filled later
		groundGroups: [],
		reinforcementTimer: state.timer,
		reinforcementDelay: Minutes(30),
		awacsFrequency: 285.0,
		downedPilots: [],
		ews: [], // will be filled with addEWs()
		structures: generateStructures(scenario.blue, dataStore),
	};

	state.redFaction = {
		...redBaseFaction,
		countryName: redBaseFaction.countryName as DcsJs.CountryName,
		airdromeNames: scenario.red.airdromeNames as DcsJs.AirdromeName[],

		inventory: {
			aircrafts: generateAircraftInventory({
				coalition: "red",
				faction: redBaseFaction,
				scenario,
				dataStore,
				objectives: redObjectives,
			}),
			groundUnits: generateGroundUnitsInventory(redBaseFaction, "red", scenario),
		},
		packages: [],
		sams: [], // will be filled later
		groundGroups: [],
		reinforcementTimer: state.timer,
		reinforcementDelay: Minutes(30),
		awacsFrequency: 280.0,
		downedPilots: [],
		ews: [], // will be filled with addEWs()
		structures: generateStructures(scenario.red, dataStore),
	};

	state.objectives =
		dataStore.objectives?.reduce((prev, dataObjective) => {
			const isBlue = claimsObjective(scenario.blue, dataObjective.name);
			const isRed = claimsObjective(scenario.red, dataObjective.name);

			if (!isBlue && !isRed) {
				return prev;
			}

			const faction = isBlue ? state.blueFaction : state.redFaction;

			if (faction == null) {
				return prev;
			}

			const inventory = faction.inventory;
			const groupType = random(1, 100) > 40 ? "armor" : "infantry";
			const units = Object.values(inventory.groundUnits)
				.filter((unit) => unit.category !== "Air Defence")
				.filter((unit) => {
					if (groupType === "infantry") {
						return unit.category === "Infantry" && unit.state === "idle";
					} else {
						return unit.category !== "Infantry" && unit.state === "idle";
					}
				})
				.slice(0, random(4, 8));

			if (groupType === "armor") {
				const airDefenceUnits = Object.values(inventory.groundUnits).filter(
					(unit) =>
						unit.vehicleTypes.some((vt) => vt === "SHORAD") &&
						!unit.vehicleTypes.some((vt) => vt === "Infantry") &&
						unit.state === "idle"
				);
				const count = random(0, 100) > 10 ? random(1, 2) : 0;

				const usableADUnits = getUsableUnit(airDefenceUnits, "name", count);

				const selectedADUnits = usableADUnits.slice(0, count);

				selectedADUnits.forEach((unit) => units.push(unit));
			} else if (groupType === "infantry") {
				const airDefenceUnits = Object.values(inventory.groundUnits).filter(
					(unit) =>
						unit.vehicleTypes.some((vt) => vt === "SHORAD") &&
						unit.vehicleTypes.some((vt) => vt === "Infantry") &&
						unit.state === "idle"
				);

				const count = random(0, 100) > 50 ? random(1, 2) : 0;

				const usableADUnits = getUsableUnit(airDefenceUnits, "name", count);

				const selectedADUnits = usableADUnits.slice(0, count);

				selectedADUnits.forEach((unit) => units.push(unit));
			}

			const objective: DcsJs.CampaignObjective = {
				name: dataObjective.name,
				position: dataObjective.position,
				coalition: isBlue ? "blue" : "red",
				deploymentDelay: isBlue ? Minutes(30) : Minutes(60),
				deploymentTimer: state.timer,
				incomingGroundGroups: {},
			};

			const vehicleTargets = dataStore.strikeTargets?.[dataObjective.name]?.filter(
				(target) => target.type === "Vehicle"
			);

			if ((vehicleTargets?.length ?? 0) > 0) {
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
					startObjective: objective,
					position: objective.position,
					state: "on objective",
					unitIds: units.map((u) => u.id),
					startTime: state.timer,
					groupType,
				});
			}

			prev[objective.name] = objective;
			return prev;
		}, {} as Record<string, DcsJs.CampaignObjective>) ?? {};

	addEWs(state, scenario);
	generateSams("blue", state.blueFaction, dataStore, scenario);
	generateSams("red", state.redFaction, dataStore, scenario);

	state.name = scenario.name;
	state.active = true;
	state.winningCondition = scenario["win-condition"];
	state.aiSkill = aiSkill;
	state.hardcore = hardcore;

	return state;
};
