import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { unwrap } from "solid-js/store";
import { v4 as uuid } from "uuid";

import { scenarioList } from "../../data/scenarios";
import * as Domain from "../../domain";
import { getCurrentWeather } from "../../domain/weather";
import { firstItem, Minutes } from "../../utils";
import { generateAircraftInventory } from "./generateAircraftInventory";
import { generateGroundGroups } from "./generateGroundGroups";
import { generateGroundUnitsInventory } from "./generateGroundUnitsInventory";
import { generateObjectivePlans } from "./generateObjectivePlans";
import { generateSams } from "./generateSams";
import { generateStructures } from "./generateStructures";
import { factionCarrierName } from "./utils";

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
	training: boolean,
	nightMissions: boolean,
	badWeather: boolean,
	scenarioName: string,
) => {
	const scenario = scenarioList.find((sc) => sc.name === scenarioName);
	const airdromes = dataStore.airdromes;
	const objectives = dataStore.objectives;
	const strikeTargets = dataStore.strikeTargets;

	if (scenario == null) {
		throw new Error("createCampaign: unknown scenario");
	}

	if (airdromes == null) {
		throw new Error("createCampaign: unknown airdromes");
	}

	if (objectives == null) {
		throw new Error("createCampaign: unknown objectives");
	}

	if (strikeTargets == null) {
		throw new Error("createCampaign: unknown objectives");
	}

	const blueAirdromes = scenario.blue.airdromeNames.map((name) => {
		const airdrome = airdromes[name];

		if (airdrome == null) {
			throw new Error(`airdrome: ${name} not found`);
		}

		return airdrome;
	});

	const redAirdromes = scenario.red.airdromeNames.map((name) => {
		const airdrome = airdromes[name];

		if (airdrome == null) {
			throw new Error(`airdrome: ${name} not found`);
		}

		return airdrome;
	});

	const [blueOps, redOps] = generateObjectivePlans(
		structuredClone(unwrap(blueAirdromes)),
		structuredClone(unwrap(redAirdromes)),
		structuredClone(unwrap(blueAirdromes)),
		structuredClone(unwrap(redAirdromes)),
		dataStore,
	);

	const firstBlueAirdromeName = firstItem(scenario.blue.airdromeNames) as DcsJs.AirdromeName | undefined;

	if (firstBlueAirdromeName == null) {
		throw "createCampaign: unknown firstBlueAirdromeName";
	}

	const firstBlueAirdrome = airdromes[firstBlueAirdromeName];

	if (firstBlueAirdrome == null) {
		throw "unknown airdrome";
	}

	const blueObjectives: Types.Campaign.DataStore["objectives"] = blueOps.map((dop) => dop.objective);
	const redObjectives: Types.Campaign.DataStore["objectives"] = redOps.map((dop) => dop.objective);

	/* dataStore.objectives?.forEach((dataObjective) => {
		const isBlue = claimsObjective(scenario.blue, dataObjective.name);
		const isRed = claimsObjective(scenario.red, dataObjective.name);

			if (isBlue) {
				blueObjectives.push(dataObjective);
			}

			if (isRed) {
				redObjectives.push(dataObjective);
			}
		}
	}); */

	const blueCarrierName = factionCarrierName("blue", scenario, blueFaction, dataStore);

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
				objectivePlans: blueOps,
				carrierName: blueCarrierName,
				oppObjectives: redObjectives,
			}),
			groundUnits: generateGroundUnitsInventory(blueFaction, "blue", scenario, dataStore),
		},
		packages: [],
		groundGroups: [],
		awacsFrequency: 251,
		structures: generateStructures("blue", blueOps, dataStore),
		reinforcementTimer: state.timer,
		reinforcementDelay: Minutes(30),
		downedPilots: [],
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
				objectivePlans: redOps,
				oppObjectives: blueObjectives,
			}),
			groundUnits: generateGroundUnitsInventory(redFaction, "red", scenario, dataStore),
		},
		packages: [],
		groundGroups: [],
		awacsFrequency: 251,
		structures: generateStructures("red", redOps, dataStore),
		reinforcementTimer: state.timer,
		reinforcementDelay: Minutes(30),
		downedPilots: [],
	};

	state.objectives =
		dataStore.objectives?.reduce(
			(prev, dataObjective) => {
				const isBlue = blueOps.some((obj) => obj.objectiveName === dataObjective.name);
				const isRed = redOps.some((obj) => obj.objectiveName === dataObjective.name);

				if (!isBlue && !isRed) {
					return prev;
				}

				const faction = isBlue ? state.blueFaction : state.redFaction;

				if (faction == null) {
					return prev;
				}

				const objective: DcsJs.CampaignObjective = {
					name: dataObjective.name,
					position: dataObjective.position,
					coalition: isBlue ? "blue" : "red",
					deploymentDelay: isBlue ? Minutes(30) : Minutes(60),
					deploymentTimer: state.timer,
					incomingGroundGroups: {},
				};

				prev[objective.name] = objective;
				return prev;
			},
			{} as Record<string, DcsJs.CampaignObjective>,
		) ?? {};

	generateGroundGroups(blueOps, state.blueFaction, state.timer);
	generateGroundGroups(redOps, state.redFaction, state.timer);
	generateSams("blue", state.blueFaction, dataStore, blueOps);
	generateSams("red", state.redFaction, dataStore, redOps);

	if (blueCarrierName && state.blueFaction.carrierName != null) {
		const objective = dataStore.objectives?.find((obj) => obj.name === scenario.blue.carrierObjective);

		if (objective != null) {
			state.blueFaction.shipGroups = [
				{
					name: state.blueFaction.carrierName,
					position: objective.position,
				},
			];
		}
	}

	const weatherOffset = Domain.Utils.random(-3, 3);
	const cloudCoverData = Domain.Weather.generateCloudCover(
		dataStore.mapInfo?.weather.cloudCover.baseCloudCover ?? 0,
		dataStore.mapInfo?.weather.cloudCover.seasonEffect ?? 0,
	);

	const currentWeather = getCurrentWeather(state.timer, weatherOffset, cloudCoverData, badWeather, dataStore);

	state.id = uuid();
	state.name = scenario.name;
	state.active = true;
	state.loaded = true;
	state.winningCondition = scenario["win-condition"];
	state.aiSkill = aiSkill;
	state.hardcore = hardcore;
	state.training = training;
	state.allowNightMissions = nightMissions;
	state.allowBadWeather = badWeather;
	state.winner = undefined;
	state.toastMessages = [];
	state.weather = {
		temperature: currentWeather.temperature,
		offset: weatherOffset,
		wind: currentWeather.wind,
		cloudCover: currentWeather.cloudCover,
		cloudCoverData,
	};

	return state;
};
