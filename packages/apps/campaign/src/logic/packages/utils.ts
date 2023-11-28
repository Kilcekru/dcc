import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Config } from "../../data";
import * as Domain from "../../domain";
import { getDurationEnRoute, getUsableAircraftsByType, objectToPosition, positionFromHeading } from "../../utils";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction, getLoadoutForAircraftType } from "../utils";

export const updateAircraftForFlightGroup = (
	flightGroup: DcsJs.FlightGroup,
	state: RunningCampaignState,
	coalition: DcsJs.Coalition,
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

export function calcFrequency(
	aircraftType: string | undefined,
	faction: DcsJs.CampaignFaction,
	dataStore: Types.Campaign.DataStore,
) {
	if (aircraftType == null) {
		return Domain.Random.number(310, 343);
	}

	if ((aircraftType as DcsJs.AircraftType) === "MiG-15bis") {
		return Domain.Random.number(0, 50) * 0.025 + 3.75;
	}

	const usedFrequencies = faction.packages.map((pkg) => pkg.frequency);

	const aircraftDefinition = dataStore.aircrafts?.[aircraftType as DcsJs.AircraftType];

	const rangeFrom = aircraftDefinition?.allowedFrequency == null ? 310 : aircraftDefinition.allowedFrequency[0];
	const rangeTo = aircraftDefinition?.allowedFrequency == null ? 399 : aircraftDefinition.allowedFrequency[1];

	const frequencyRange = Array.from({ length: rangeTo - rangeFrom + 1 }).map((v, i) => rangeFrom + i);

	const selectedFrequency = Domain.Random.item(
		frequencyRange,
		(freq) => !usedFrequencies.some((used) => freq === used),
	);

	return selectedFrequency ?? 399;
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

export function getPackageAircrafts<Position extends DcsJs.Position>({
	state,
	faction,
	coalition,
	aircraftTypes,
	task,
	count,
	withMaxDistance,
	dataStore,
	excludedAircrafts,
}: {
	state: RunningCampaignState;
	faction: DcsJs.CampaignFaction;
	coalition: DcsJs.Coalition;
	aircraftTypes: Array<string> | undefined;
	task?: DcsJs.Task;
	count: number;
	dataStore: Types.Campaign.DataStore;
	withMaxDistance?: {
		distance: number;
		position: DcsJs.Position | Array<Position>;
	};
	excludedAircrafts?: Array<DcsJs.Aircraft>;
}): { aircrafts: Array<DcsJs.Aircraft>; startPosition: ReturnType<typeof getStartPosition> } | undefined {
	const usableAircrafts = getUsableAircraftsByType(state, coalition, aircraftTypes, task, count);
	const validAircrafts =
		excludedAircrafts == null
			? usableAircrafts
			: usableAircrafts.filter((ac) => !excludedAircrafts.some((eac) => ac.id === eac.id));

	if (validAircrafts == null || validAircrafts.length === 0) {
		// eslint-disable-next-line no-console
		console.warn("no usable aircrafts available", aircraftTypes, task, { usableAircrafts, excludedAircrafts });
		return;
	}

	const aircraftsPerAirdrome: Record<string, Array<DcsJs.Aircraft>> = {};

	validAircrafts.forEach((ac) => {
		if (aircraftsPerAirdrome[ac.homeBase.name] == null) {
			aircraftsPerAirdrome[ac.homeBase.name] = [ac];
		} else {
			aircraftsPerAirdrome[ac.homeBase.name]?.push(ac);
		}
	});

	// Only allow home bases with at least the min count of aircrafts
	const validHomeBaseNames = Object.entries(aircraftsPerAirdrome)
		.filter(([_, value]) => value.length >= count)
		.map(([key]) => key);

	// Filter the home bases by distance if needed
	const homeBasesInRange = withMaxDistance
		? validHomeBaseNames
				.map((name) => Domain.Structure.getHomeBaseFromName(name, faction, dataStore))
				.filter((homeBase) => {
					if (homeBase == null) {
						return false;
					}

					if (Array.isArray(withMaxDistance.position)) {
						return withMaxDistance.position.some((pos) => {
							const distance = Domain.Location.distanceToPosition(pos, objectToPosition(homeBase));

							return distance <= withMaxDistance.distance;
						});
					} else {
						const distance = Domain.Location.distanceToPosition(withMaxDistance.position, objectToPosition(homeBase));

						return distance <= withMaxDistance.distance;
					}
				})
				.map((airdrome) => airdrome?.name ?? "")
		: validHomeBaseNames;

	// Check if the home bases are in range of a ready barrack if needed
	const barrackHomeBases =
		task === "Air Assault"
			? (() => {
					// Get barracks that are ready
					const barracks = Domain.Structure.getAirAssaultReadyBarracks(faction);

					// Filter the home bases which are in range of a ready barrack
					return homeBasesInRange.filter((homeBaseName) => {
						const homeBase = Domain.Structure.getHomeBaseFromName(homeBaseName, faction, dataStore);

						if (homeBase == null) {
							return false;
						}

						return Domain.Location.someInside(
							barracks,
							objectToPosition(homeBase),
							Config.structureRange.frontline.barrack * 0.75,
						);
					});
			  })()
			: homeBasesInRange;

	const selectedHomeBase = Domain.Random.item(barrackHomeBases);

	if (selectedHomeBase == null || selectedHomeBase == "") {
		return;
	}

	const selectedAircrafts = aircraftsPerAirdrome[selectedHomeBase];

	if (selectedAircrafts == null) {
		return;
	}
	const startPosition = getStartPosition(Domain.Utils.firstItem(selectedAircrafts)?.homeBase, faction, dataStore);

	return {
		aircrafts: selectedAircrafts.slice(0, count),
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

export function calcHoldWaypoint(
	startPosition: DcsJs.Position,
	targetPosition: DcsJs.Position,
	cruiseSpeed: number,
): [DcsJs.CampaignWaypoint, DcsJs.Position, number] {
	const targetHeading = Utils.Location.headingToPosition(startPosition, targetPosition);

	const holdPosition = positionFromHeading(startPosition, targetHeading, 20_000);
	const durationIngress = getDurationEnRoute(startPosition, holdPosition, cruiseSpeed);

	const holdTime = Config.waypoint.takeOff + durationIngress;
	const holdDuration = Domain.Time.Minutes(5);
	const holdEndTime = holdTime + holdDuration;

	const waypoint: DcsJs.CampaignWaypoint = {
		name: "Hold",
		position: holdPosition,
		time: holdTime,
		speed: cruiseSpeed,
		duration: holdDuration,
		hold: true,
		taskStart: false,
	};

	return [waypoint, holdPosition, holdEndTime];
}
