import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

export function inventoryUnit(unit: DcsJs.FlightGroupUnit, faction: DcsJs.CampaignFaction) {
	return faction.inventory.aircrafts[unit.id];
}

export function unitType(
	unit: DcsJs.FlightGroupUnit,
	faction: DcsJs.CampaignFaction,
	dataStore: Types.Campaign.DataStore,
) {
	const iUnit = inventoryUnit(unit, faction);
	return dataStore.aircrafts?.[iUnit?.aircraftType as DcsJs.AircraftType];
}
export function unitIsHelicopter(
	unit: DcsJs.FlightGroupUnit,
	faction: DcsJs.CampaignFaction,
	dataStore: Types.Campaign.DataStore,
) {
	const type = unitType(unit, faction, dataStore);

	return type?.isHelicopter;
}

export function hasHelicopter(
	flightGroup: DcsJs.CampaignFlightGroup,
	faction: DcsJs.CampaignFaction,
	dataStore: Types.Campaign.DataStore,
) {
	return flightGroup.units.some((u) => unitIsHelicopter(u, faction, dataStore));
}
