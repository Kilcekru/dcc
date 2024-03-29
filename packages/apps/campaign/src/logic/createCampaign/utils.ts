import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { ObjectivePlan, Scenario, ScenarioCoalition } from "../../data";

export type DynamicObjectivePlan = ObjectivePlan & { objective: DcsJs.Import.Objective };

export const claimsObjective = (coalition: ScenarioCoalition, objectiveName: string) => {
	if (coalition.objectivePlans.some((plan) => objectiveName.toLowerCase() === plan.objectiveName.toLowerCase())) {
		return true;
	}

	return false;
};

export function factionCarrierName(
	coalition: DcsJs.Coalition,
	scenario: Scenario,
	faction: DcsJs.Faction,
	dataStore: Types.Campaign.DataStore,
) {
	const scenarioSide = coalition === "red" ? scenario.red : scenario.blue;

	if (scenarioSide.carrierObjective == null) {
		return undefined;
	}

	let carrierName = undefined;

	Object.values(faction.aircraftTypes).forEach((aircraftTypes) => {
		aircraftTypes.forEach((type) => {
			const aircraft = dataStore.aircrafts?.[type as DcsJs.AircraftType];

			if (aircraft == null) {
				return;
			}

			if (aircraft.carrierCapable && !aircraft.isHelicopter && faction.carrierName != null) {
				carrierName = faction.carrierName;
			}
		});
	});

	return carrierName;
}
