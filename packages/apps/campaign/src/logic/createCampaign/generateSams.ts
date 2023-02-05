import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import { Scenario } from "../../data/scenarios";
import { firstItem, randomItem } from "../../utils";

export const generateSams = (
	coalition: DcsJs.CampaignCoalition,
	faction: DcsJs.FactionDefinition,
	dataStore: DataStore,
	scenario: Scenario
): Array<DcsJs.CampaignSam> => {
	if (coalition === "neutral") {
		return [];
	}

	const samTemplate = dataStore.samTemplates?.[(firstItem(faction.template.sams) ?? "SA-2") as DcsJs.SAMType];

	if (samTemplate == null) {
		return [];
	}

	const templateVehicles =
		samTemplate?.units.reduce((prev, name) => {
			const vehicle = dataStore.vehicles?.[name];

			if (vehicle == null) {
				return prev;
			}

			const id = createUniqueId();
			const unit: DcsJs.CampaignUnit = {
				alive: true,
				id,
				state: "on objective",
				displayName: `${vehicle.name}|${id}`,
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

	const selectedTargets: DcsJs.StrikeTarget[] = [];

	scenario[coalition].samNames.forEach((name) => {
		const targets = strikeTargets[name];

		if (targets == null) {
			return;
		}

		const samTargets = targets.filter((target) => target.type === "SAM");

		const selectedTarget = randomItem(samTargets);

		if (selectedTarget == null) {
			return;
		}

		selectedTargets.push(selectedTarget);
	});

	/* const blueAirdromes = scenario.blue.airdromeNames.map((name) => airdromes[name as DcsJs.AirdromeName]);
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
	} */

	return selectedTargets.map((sam) => {
		const objectiveTarget = Object.entries(strikeTargets).find(([, targets]) =>
			targets.some((target) => target.name === sam.name)
		);

		if (objectiveTarget == null) {
			throw "no objective target found";
		}

		return {
			id: createUniqueId(),
			position: sam.position,
			range: samTemplate.range,
			units: templateVehicles,
			operational: true,
			fireInterval: samTemplate.fireInterval,
			weaponReadyTimer: 0,
			name: sam.name,
			objectiveName: objectiveTarget[0],
		};
	});
};
