import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import { ObjectivePlan } from "../../data/scenarios";
import * as Domain from "../../domain";

function getTemplate(faction: DcsJs.CampaignFaction, dataStore: Types.Campaign.DataStore) {
	const template = dataStore.groundUnitsTemplates?.find((t) => faction.templateName === t.name);

	if (template == null) {
		throw new Error(`generateSams: ground units template: ${faction.templateName} not found`);
	}

	const samType = Domain.Random.item(template.sams) as DcsJs.SamType;

	const samTemplate = dataStore.samTemplates?.[samType];

	if (samTemplate == null) {
		return;
	}

	const samUnits =
		samTemplate?.units.reduce((prev, name) => {
			const vehicle = dataStore.vehicles?.[name];

			if (vehicle == null) {
				// eslint-disable-next-line no-console
				console.error("vehicle not found", name);
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

	const units = Object.values(faction.inventory.groundUnits)
		.filter((unit) => unit.vehicleTypes.some((vt) => vt === "SHORAD") && unit.state === "idle")
		.slice(0, Domain.Random.number(1, 2));

	units.forEach((unit) => {
		const inventoryUnit = faction.inventory.groundUnits[unit.id];

		if (inventoryUnit == null) {
			return;
		}

		inventoryUnit.state = "on objective";
		samUnits.push(unit);
	});

	return {
		type: samType,
		units: samUnits,
		range: samTemplate.range,
		fireInterval: samTemplate.fireInterval,
	};
}

export const generateSams = (
	coalition: DcsJs.Coalition,
	faction: DcsJs.CampaignFaction,
	dataStore: Types.Campaign.DataStore,
	objectivePlans: Array<ObjectivePlan>,
) => {
	if (coalition === "neutrals") {
		return;
	}

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

	objectivePlans.forEach((objectivePlan) => {
		const withSam = objectivePlan.groundUnitTypes.some((gut) => gut === "sam");

		if (!withSam) {
			return;
		}

		const targets = strikeTargets[objectivePlan.objectiveName];

		if (targets == null) {
			return;
		}

		const samTargets = targets.filter((target) => target.type === "SAM");

		const selectedTarget = Domain.Random.item(samTargets);

		if (selectedTarget == null) {
			return;
		}

		selectedTargets.push(selectedTarget);
	});

	selectedTargets.forEach((sam) => {
		const template = getTemplate(faction, dataStore);

		if (template == null) {
			// eslint-disable-next-line no-console
			console.warn("no template found");

			return;
		}

		template.units.forEach((unit) => {
			faction.inventory.groundUnits[unit.id] = unit;
		});

		const group: DcsJs.SamGroup = {
			id: createUniqueId(),
			name: sam.name,
			position: sam.position,
			range: template.range,
			unitIds: template.units.map((unit) => unit.id),
			shoradUnitIds: [],
			operational: true,
			fireInterval: template.fireInterval,
			combatTimer: 0,
			samType: template.type,
			objectiveName: sam.objectiveName,
			startObjectiveName: sam.objectiveName,
			startTime: 0,
			state: "on objective",
			type: "sam",
		};

		faction.groundGroups.push(group);
	});
};
