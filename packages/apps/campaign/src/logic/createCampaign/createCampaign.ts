import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { unwrap } from "solid-js/store";
import { v4 as uuid } from "uuid";

import { Config } from "../../data";
import { scenarioList, StructurePlan } from "../../data/scenarios";
import * as Domain from "../../domain";
import { firstItem, getUsableUnit, Minutes, random, randomItem, randomList } from "../../utils";
import { generateAircraftInventory } from "./generateAircraftInventory";
import { generateGroundGroups } from "./generateGroundGroups";
import { generateGroundUnitsInventory } from "./generateGroundUnitsInventory";
import { generateSams } from "./generateSams";
import { generateStructures } from "./generateStructures";
import { DynamicObjectivePlan } from "./utils";

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

	// const blueObjectives: DcsJs.Import.Objective = [];

	function selectObjective(sourcePosition: DcsJs.Position, targetPosition: DcsJs.Position) {
		const sourceDistance = Domain.Location.distanceToPosition(sourcePosition, targetPosition);

		const nearbyObjectives = Domain.Location.findInside(objectives, sourcePosition, (obj) => obj.position, 30_000);

		const forwardObjectives = nearbyObjectives.filter((obj) => {
			const objDistance = Domain.Location.distanceToPosition(obj.position, targetPosition);

			return objDistance < sourceDistance && objDistance > 30_000;
		});

		const selectedObjective = Domain.Utils.randomItem(forwardObjectives);

		return selectedObjective;
	}

	function addObjectivePlan(
		objectivePlans: Array<DynamicObjectivePlan>,
		objective: DcsJs.Import.Objective,
		groundUnit?: string,
		structure?: StructurePlan
	) {
		const next = structuredClone(unwrap(objectivePlans)) as Array<DynamicObjectivePlan>;
		const index = objectivePlans.findIndex((plan) => plan.objectiveName === objective.name);

		if (index === -1) {
			next.push({
				objectiveName: objective.name,
				structures: structure == null ? [] : [structure],
				groundUnitTypes: groundUnit == null ? [] : [groundUnit],
				objective,
			});
		} else {
			const prev = objectivePlans[index];
			const structures = prev?.structures ?? [];
			const groundUnitTypes = prev?.groundUnitTypes ?? [];
			next[index] = {
				objectiveName: objective.name,
				structures: structure == null ? structures : [...structures, structure],
				groundUnitTypes: groundUnit == null ? groundUnitTypes : [...groundUnitTypes, groundUnit],
				objective,
			};
		}

		return next;
	}

	function addBasicObjective(
		sourcePositions: Array<DcsJs.Position | undefined>,
		oppAirdromes: Array<DcsJs.DCS.Airdrome>,
		objectivePlans: Array<DynamicObjectivePlan>,
		oppObjectivePlans: Array<DynamicObjectivePlan>
	) {
		let next = structuredClone(unwrap(objectivePlans)) as Array<DynamicObjectivePlan>;

		sourcePositions.map((sourcePosition, i) => {
			if (sourcePosition == null) {
				return;
			}

			const oppAirdrome = Domain.Location.findNearest(oppAirdromes, sourcePosition, (ad) => ad);

			if (oppAirdrome == null) {
				throw new Error("no red airdrome found");
			}
			const selectedObjective = selectObjective(sourcePosition, oppAirdrome);

			if (selectedObjective != null) {
				next = addObjectivePlan(objectivePlans, selectedObjective);

				const oppObjectivesInRange = Domain.Location.findInside(
					oppObjectivePlans,
					selectedObjective.position,
					(obj) => obj.objective.position,
					30_000
				);

				if (oppObjectivesInRange.length > 0) {
					sourcePositions[i] = undefined;
				} else {
					sourcePositions[i] = selectedObjective?.position;
				}
			} else {
				sourcePositions[i] = undefined;
			}
		});

		return next;
	}

	function addAirdromeSamObjectives(
		airdromes: Array<DcsJs.DCS.Airdrome>,
		oppAirdromes: Array<DcsJs.DCS.Airdrome>,
		objectives: Array<DcsJs.Import.Objective>,
		objectivePlans: Array<DynamicObjectivePlan>
	) {
		let next = structuredClone(unwrap(objectivePlans)) as Array<DynamicObjectivePlan>;

		airdromes.forEach((airdrome) => {
			const oppAirdrome = Domain.Location.findNearest(oppAirdromes, airdrome, (ad) => ad);

			if (oppAirdrome == null) {
				return;
			}

			const nearbyObjectives = Domain.Location.findInside(objectives, airdrome, (obj) => obj.position, 40_000);
			const sourceDistance = Domain.Location.distanceToPosition(airdrome, oppAirdrome);

			const forwardObjectives = nearbyObjectives.filter((obj) => {
				const objDistance = Domain.Location.distanceToPosition(obj.position, oppAirdrome);

				return objDistance < sourceDistance && objDistance > 30_000;
			});

			const selectedObjective = Domain.Utils.randomItem(forwardObjectives);

			if (selectedObjective == null) {
				const farEnoughFromOppAirdrome = nearbyObjectives.filter((obj) => {
					const objDistance = Domain.Location.distanceToPosition(obj.position, oppAirdrome);

					return objDistance > 30_000;
				});

				const fallbackObjective = Domain.Utils.randomItem(farEnoughFromOppAirdrome);

				if (fallbackObjective == null) {
					return;
				}

				next = addObjectivePlan(objectivePlans, fallbackObjective, "sam");

				return;
			}

			next = addObjectivePlan(objectivePlans, selectedObjective, "sam");
		});

		return next;
	}

	function validStructureObjective({
		sourcePosition,
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range,
	}: {
		sourcePosition: DcsJs.Position;
		objectivePlans: Array<DynamicObjectivePlan>;
		oppObjectivePlans: Array<DynamicObjectivePlan>;
		objectives: Array<DcsJs.Import.Objective>;
		strikeTargets: Record<string, Array<DcsJs.StrikeTarget>>;
		range: number;
	}) {
		const objectivesInRange = Domain.Location.findInside(objectives, sourcePosition, (obj) => obj.position, range);

		const freeObjectives = objectivesInRange.filter((obj) => {
			const plan = objectivePlans.find((op) => op.objectiveName === obj.name);
			const target = strikeTargets[obj.name];

			if (target == null) {
				return false;
			}

			const targetCount = target.filter((trg) => trg.type === "Structure").length;

			if (targetCount === 0) {
				return false;
			}

			if (plan == null) {
				return true;
			}

			const planCount = plan.structures.length;

			return planCount < targetCount;
		});

		const friendlyObjectives = freeObjectives.filter((obj) => {
			const nearestCoalition = Domain.Location.findNearest(objectivePlans, obj.position, (op) => op.objective.position);
			const nearestOpp = Domain.Location.findNearest(oppObjectivePlans, obj.position, (op) => op.objective.position);

			if (nearestCoalition == null) {
				return false;
			}

			if (nearestOpp == null) {
				return true;
			}

			const coalitionDistance = Domain.Location.distanceToPosition(nearestCoalition.objective.position, obj.position);
			const oppDistance = Domain.Location.distanceToPosition(nearestOpp.objective.position, obj.position);

			return coalitionDistance <= oppDistance;
		});

		return randomItem(friendlyObjectives);
	}

	function addStructures({
		objectivePlans,
		oppObjectivePlans,
		objectives,
		strikeTargets,
		range,
		structureType,
	}: {
		objectivePlans: Array<DynamicObjectivePlan>;
		oppObjectivePlans: Array<DynamicObjectivePlan>;
		objectives: Array<DcsJs.Import.Objective>;
		strikeTargets: Record<string, Array<DcsJs.StrikeTarget>>;
		range: number;
		structureType: DcsJs.StructureType;
	}) {
		let next = structuredClone(unwrap(objectivePlans)) as Array<DynamicObjectivePlan>;

		objectivePlans.forEach((plan) => {
			const existingStructures = next.filter((op) => op.structures.some((str) => str.structureType === structureType));

			const existingStructuresInRange = Domain.Location.findInside(
				existingStructures,
				plan.objective.position,
				(pp) => pp.objective.position,
				range
			);

			if (existingStructuresInRange.length > 0) {
				return;
			}

			const selectedObjective = validStructureObjective({
				sourcePosition: plan.objective.position,
				objectivePlans: next,
				oppObjectivePlans,
				objectives,
				strikeTargets,
				range,
			});

			if (selectedObjective == null) {
				return;
			}

			const structureName = strikeTargets[selectedObjective.name]?.find(
				(trg) =>
					trg.type === "Structure" &&
					!next.some((plan) => plan.structures.some((str) => str.structureName === trg.name))
			)?.name;

			if (structureName == null) {
				return;
			}

			next = addObjectivePlan(next, selectedObjective, undefined, {
				structureName: structureName,
				structureType: structureType,
			});
		});

		return next;
	}

	function addFrontline(objectivePlans: Array<DynamicObjectivePlan>, oppObjectivePlans: Array<DynamicObjectivePlan>) {
		let next = structuredClone(unwrap(objectivePlans)) as Array<DynamicObjectivePlan>;
		objectivePlans.forEach((op) => {
			const nearestOpp = Domain.Location.findNearest(
				oppObjectivePlans,
				op.objective.position,
				(op) => op.objective.position
			);

			if (nearestOpp == null) {
				return;
			}

			const distance = Domain.Location.distanceToPosition(op.objective.position, nearestOpp.objective.position);

			if (distance <= 30_000) {
				next = addObjectivePlan(next, op.objective, "vehicles");
			}
		});

		return next;
	}

	let endOfLine = false;
	const blueSourcePositions: Array<DcsJs.Position | undefined> = structuredClone(
		unwrap(blueAirdromes)
	) as Array<DcsJs.Position>;
	const redSourcePositions: Array<DcsJs.Position | undefined> = structuredClone(
		unwrap(redAirdromes)
	) as Array<DcsJs.Position>;

	let blueObjs: Array<DynamicObjectivePlan> = [];
	let redObjs: Array<DynamicObjectivePlan> = [];

	// Basic Objectives
	while (!endOfLine) {
		blueObjs = addBasicObjective(blueSourcePositions, redAirdromes, blueObjs, redObjs);
		redObjs = addBasicObjective(redSourcePositions, blueAirdromes, redObjs, blueObjs);

		if (!blueSourcePositions.find((p) => p != null) && !redSourcePositions.find((p) => p != null)) {
			endOfLine = true;
		}
	}

	// SAM Objectives
	const samObjectives = objectives.filter((obj) => strikeTargets[obj.name]?.some((st) => st.type === "SAM"));

	blueObjs = addAirdromeSamObjectives(blueAirdromes, redAirdromes, samObjectives, blueObjs);
	redObjs = addAirdromeSamObjectives(redAirdromes, blueAirdromes, samObjectives, redObjs);

	// Power Plant Objectives
	// addPowerPlants(blueObjs, redObjs, objectives, strikeTargets);
	// addPowerPlants(redObjs, blueObjs, objectives, strikeTargets);

	const rangeMultiplier = 1;

	blueObjs = addStructures({
		objectivePlans: blueObjs,
		oppObjectivePlans: redObjs,
		objectives,
		strikeTargets,
		range: Config.structureRange.frontline.depot * rangeMultiplier,
		structureType: "Depot",
	});
	blueObjs = addStructures({
		objectivePlans: blueObjs,
		oppObjectivePlans: redObjs,
		objectives,
		strikeTargets,
		range: Config.structureRange.frontline.barrack * rangeMultiplier,
		structureType: "Barrack",
	});
	blueObjs = addStructures({
		objectivePlans: blueObjs,
		oppObjectivePlans: redObjs,
		objectives,
		strikeTargets,
		range: Config.structureRange.power * rangeMultiplier,
		structureType: "Power Plant",
	});
	blueObjs = addStructures({
		objectivePlans: blueObjs,
		oppObjectivePlans: redObjs,
		objectives,
		strikeTargets,
		range: Config.structureRange.ammo * rangeMultiplier,
		structureType: "Ammo Depot",
	});
	blueObjs = addStructures({
		objectivePlans: blueObjs,
		oppObjectivePlans: redObjs,
		objectives,
		strikeTargets,
		range: Config.structureRange.fuel * rangeMultiplier,
		structureType: "Fuel Storage",
	});

	redObjs = addStructures({
		objectivePlans: redObjs,
		oppObjectivePlans: blueObjs,
		objectives,
		strikeTargets,
		range: Config.structureRange.frontline.depot * rangeMultiplier,
		structureType: "Depot",
	});
	redObjs = addStructures({
		objectivePlans: redObjs,
		oppObjectivePlans: blueObjs,
		objectives,
		strikeTargets,
		range: Config.structureRange.frontline.barrack * rangeMultiplier,
		structureType: "Barrack",
	});
	redObjs = addStructures({
		objectivePlans: redObjs,
		oppObjectivePlans: blueObjs,
		objectives,
		strikeTargets,
		range: Config.structureRange.power * rangeMultiplier,
		structureType: "Power Plant",
	});
	redObjs = addStructures({
		objectivePlans: redObjs,
		oppObjectivePlans: blueObjs,
		objectives,
		strikeTargets,
		range: Config.structureRange.ammo * rangeMultiplier,
		structureType: "Ammo Depot",
	});
	redObjs = addStructures({
		objectivePlans: redObjs,
		oppObjectivePlans: blueObjs,
		objectives,
		strikeTargets,
		range: Config.structureRange.fuel * rangeMultiplier,
		structureType: "Fuel Storage",
	});

	blueObjs = addFrontline(blueObjs, redObjs);
	redObjs = addFrontline(redObjs, blueObjs);

	const firstBlueAirdromeName = firstItem(scenario.blue.airdromeNames) as DcsJs.AirdromeName | undefined;

	if (firstBlueAirdromeName == null) {
		throw "createCampaign: unknown firstBlueAirdromeName";
	}

	const firstBlueAirdrome = airdromes[firstBlueAirdromeName];

	if (firstBlueAirdrome == null) {
		throw "unknown airdrome";
	}

	const blueObjectives: Types.Campaign.DataStore["objectives"] = blueObjs.map((dop) => dop.objective);
	const redObjectives: Types.Campaign.DataStore["objectives"] = redObjs.map((dop) => dop.objective);

	/* dataStore.objectives?.forEach((dataObjective) => {
		const isBlue = claimsObjective(scenario.blue, dataObjective.name);
		const isRed = claimsObjective(scenario.red, dataObjective.name);

		if (isBlue) {
			blueObjectives.push(dataObjective);
		}

		if (isRed) {
			redObjectives.push(dataObjective);
		}
	}); */

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
		awacsFrequency: 251,
		structures: generateStructures("blue", blueObjs, dataStore),
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
		awacsFrequency: 251,
		structures: generateStructures("red", redObjs, dataStore),
		reinforcementTimer: state.timer,
		reinforcementDelay: Minutes(30),
	};

	state.objectives =
		dataStore.objectives?.reduce((prev, dataObjective) => {
			/* const isBlue = claimsObjective(scenario.blue, dataObjective.name);
			const isRed = claimsObjective(scenario.red, dataObjective.name); */
			const isBlue = blueObjs.some((obj) => obj.objectiveName === dataObjective.name);
			const isRed = redObjs.some((obj) => obj.objectiveName === dataObjective.name);

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
				/* units.forEach((unit) => {
					const inventoryUnit = inventory.groundUnits[unit.id];

					if (inventoryUnit == null) {
						console.error("inventory ground unit not found", unit.id); // eslint-disable-line no-console
						return;
					}

					inventoryUnit.state = "on objective";
				}); */
				/* const id = createUniqueId();
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
				}); */
			}

			prev[objective.name] = objective;
			return prev;
		}, {} as Record<string, DcsJs.CampaignObjective>) ?? {};

	generateGroundGroups(blueObjs, state.blueFaction, state.timer);
	generateGroundGroups(redObjs, state.redFaction, state.timer);
	generateSams("blue", state.blueFaction, dataStore, blueObjs);
	generateSams("red", state.redFaction, dataStore, redObjs);

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
