import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";
import { v4 as uuid } from "uuid";

import { scenarioList } from "../../data/scenarios";
import { firstItem, getUsableUnit, Minutes, random, randomList } from "../../utils";
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
	state: DcsJs.CampaignState,
	dataStore: Types.Campaign.DataStore,
	blueFaction: DcsJs.Faction,
	redFaction: DcsJs.Faction,
	aiSkill: DcsJs.AiSkill,
	hardcore: boolean,
	nightMissions: boolean,
	scenarioName: string
) => {
	const scenario = scenarioList.find((sc) => sc.name === scenarioName);
	const airdromes = dataStore.airdromes;

	if (scenario == null) {
		throw "createCampaign: unknown scenario";
	}

	if (airdromes == null) {
		throw "createCampaign: unknown airdromes";
	}

	const firstBlueAirdromeName = firstItem(scenario.blue.airdromeNames) as DcsJs.AirdromeName | undefined;

	if (firstBlueAirdromeName == null) {
		throw "createCampaign: unknown firstBlueAirdromeName";
	}

	const firstBlueAirdrome = airdromes[firstBlueAirdromeName];

	if (firstBlueAirdrome == null) {
		throw "unknown airdrome";
	}

	const blueObjectives: Types.Campaign.DataStore["objectives"] = [];
	const redObjectives: Types.Campaign.DataStore["objectives"] = [];

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
		...blueFaction,
		countryName: blueFaction.countryName,
		airdromeNames: scenario.blue.airdromeNames as DcsJs.AirdromeName[],
		inventory: {
			aircrafts: generateAircraftInventory({
				coalition: "blue",
				faction: blueFaction,
				scenario,
				dataStore,
				objectives: blueObjectives,
			}),
			groundUnits: generateGroundUnitsInventory(blueFaction, "blue", scenario, dataStore),
		},
		packages: [],
		groundGroups: [],
		awacsFrequency: 285.0,
		structures: generateStructures("blue", scenario.blue, dataStore),
		reinforcementTimer: state.timer,
		reinforcementDelay: Minutes(30),
	};

	state.redFaction = {
		...redFaction,
		countryName: redFaction.countryName as DcsJs.CountryName,
		airdromeNames: scenario.red.airdromeNames as DcsJs.AirdromeName[],

		inventory: {
			aircrafts: generateAircraftInventory({
				coalition: "red",
				faction: redFaction,
				scenario,
				dataStore,
				objectives: redObjectives,
			}),
			groundUnits: generateGroundUnitsInventory(redFaction, "red", scenario, dataStore),
		},
		packages: [],
		groundGroups: [],
		awacsFrequency: 280.0,
		structures: generateStructures("red", scenario.red, dataStore),
		reinforcementTimer: state.timer,
		reinforcementDelay: Minutes(30),
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

			const validGroundUnits = Object.values(inventory.groundUnits)
				.filter((unit) => unit.category !== "Air Defence")
				.filter((unit) => {
					if (groupType === "infantry") {
						return unit.category === "Infantry" && unit.state === "idle";
					} else {
						return unit.category !== "Infantry" && unit.state === "idle";
					}
				});

			const units = randomList(validGroundUnits, random(4, 8));

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

				const id = createUniqueId();
				faction.groundGroups.push({
					id,
					name: objective.name + "-" + id,
					objectiveName: objective.name,
					startObjectiveName: objective.name,
					position: objective.position,
					state: "on objective",
					unitIds: units.map((u) => u.id),
					startTime: state.timer,
					type: groupType,
				});
			}

			prev[objective.name] = objective;
			return prev;
		}, {} as Record<string, DcsJs.CampaignObjective>) ?? {};

	generateSams("blue", state.blueFaction, dataStore, scenario);
	generateSams("red", state.redFaction, dataStore, scenario);

	state.id = uuid();
	state.name = scenario.name;
	state.active = true;
	state.loaded = true;
	state.winningCondition = scenario["win-condition"];
	state.aiSkill = aiSkill;
	state.hardcore = hardcore;
	state.allowNightMissions = nightMissions;
	state.winner = undefined;
	state.toastMessages = [];

	return state;
};
