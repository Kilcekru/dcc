import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import * as Domain from "../../domain";
import { getUsableAircraftsByType } from "../../utils";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction, getLoadoutForAircraftType } from "../utils";

export const updateAircraftForFlightGroup = (
	flightGroup: DcsJs.FlightGroup,
	state: RunningCampaignState,
	coalition: DcsJs.CampaignCoalition,
	dataStore: Types.Campaign.DataStore,
) => {
	const faction = getCoalitionFaction(coalition, state);

	flightGroup.units.forEach((unit) => {
		const aircraft = faction.inventory.aircrafts[unit.id];

		if (aircraft == null) {
			throw new Error("aircraft not found: " + unit.id);
		}

		aircraft.state = "waiting";
		aircraft.loadout = getLoadoutForAircraftType(
			aircraft.aircraftType as DcsJs.AircraftType,
			flightGroup.task,
			dataStore,
		);
	});
};

export function calcFrequency(aircraftType: string | undefined, dataStore: Types.Campaign.DataStore) {
	if (aircraftType == null) {
		return Domain.Utils.random(310, 343);
	}

	if ((aircraftType as DcsJs.AircraftType) === "MiG-15bis") {
		Domain.Utils.random(0, 50) * 0.025 + 3.75;
	}

	const aircraftDefinition = dataStore.aircrafts?.[aircraftType as DcsJs.AircraftType];

	return aircraftDefinition?.allowedFrequency == null
		? Domain.Utils.random(310, 343)
		: Domain.Utils.random(aircraftDefinition.allowedFrequency[0], aircraftDefinition.allowedFrequency[1]);
}

export function getStartPosition(
	homeBase: DcsJs.CampaignHomeBase | undefined,
	faction: DcsJs.CampaignFaction,
	dataStore: Types.Campaign.DataStore,
): (DcsJs.Position & { name: string }) | undefined {
	switch (homeBase?.type) {
		case "carrier": {
			const shipGroup = Domain.Utils.firstItem(faction.shipGroups);

			if (shipGroup == null) {
				return undefined;
			}

			return {
				...shipGroup.position,
				name: shipGroup.name,
			};
		}
		case "airdrome": {
			return dataStore.airdromes?.[homeBase.name as DcsJs.AirdromeName];
		}
		case "farp": {
			const farp = faction.structures[homeBase.name];

			if (farp == null) {
				return undefined;
			}

			return {
				...farp.position,
				name: farp.name,
			};
		}
	}

	return undefined;
}

export function getPackageAircrafts({
	state,
	faction,
	coalition,
	aircraftTypes,
	count,
	dataStore,
}: {
	state: RunningCampaignState;
	faction: DcsJs.CampaignFaction;
	coalition: DcsJs.CampaignCoalition;
	aircraftTypes: Array<string> | undefined;
	count: number;
	dataStore: Types.Campaign.DataStore;
}): { aircrafts: Array<DcsJs.Aircraft>; startPosition: ReturnType<typeof getStartPosition> } | undefined {
	const usableAircrafts = getUsableAircraftsByType(state, coalition, aircraftTypes, count);

	if (usableAircrafts == null || usableAircrafts.length === 0) {
		return;
	}

	const aircraftsPerAirdrome: Record<string, Array<DcsJs.Aircraft>> = {};

	usableAircrafts.forEach((ac) => {
		if (aircraftsPerAirdrome[ac.homeBase.name] == null) {
			aircraftsPerAirdrome[ac.homeBase.name] = [ac];
		} else {
			aircraftsPerAirdrome[ac.homeBase.name]?.push(ac);
		}
	});

	const validAirdromeNames = Object.entries(aircraftsPerAirdrome)
		.filter(([_, value]) => value.length >= count)
		.map(([key]) => key);

	const selectedAirdromeName = Domain.Utils.randomItem(validAirdromeNames);

	if (selectedAirdromeName == null) {
		return undefined;
	}

	const selectedAircrafts = aircraftsPerAirdrome[selectedAirdromeName];

	if (selectedAircrafts == null) {
		return undefined;
	}
	const startPosition = getStartPosition(Domain.Utils.firstItem(selectedAircrafts)?.homeBase, faction, dataStore);

	return {
		aircrafts: selectedAircrafts,
		startPosition,
	};
}

export function getCruiseSpeed(aircrafts: Array<DcsJs.Aircraft>, dataStore: Types.Campaign.DataStore) {
	return aircrafts.reduce((prev, ac) => {
		const aircraftData = dataStore.aircrafts?.[ac.aircraftType as DcsJs.AircraftType];

		if (aircraftData == null) {
			return prev;
		}

		return aircraftData.cruiseSpeed < prev ? aircraftData.cruiseSpeed : prev;
	}, 999);
}
