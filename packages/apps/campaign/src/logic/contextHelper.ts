import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import * as Domain from "../domain";
import { getFlightGroups } from "../utils";
import { createDownedPilot } from "./createDownedPilot";

export const findFlightGroupForAircraft = (faction: DcsJs.CampaignFaction, aircraftId: string) => {
	const flightGroups = getFlightGroups(faction.packages);

	return flightGroups.find((fg) => fg.units.some((unit) => unit.id === aircraftId));
};

export const killedGroundUnitIds = (
	faction: DcsJs.CampaignFaction,
	killedGroundUnitNames: Array<string>,
	excludeSam?: boolean,
) => {
	const ids: Array<string> = [];

	Object.values(faction.inventory.groundUnits).forEach((unit) => {
		if (killedGroundUnitNames.some((name) => name === unit.displayName)) {
			if (excludeSam) {
				if (!unit.vehicleTypes.some((vt) => ["Track Radar", "Search Radar", "SAM Launcher"].includes(vt))) {
					ids.push(unit.id);
				}
			} else {
				ids.push(unit.id);
			}
		}
	});

	return ids;
};

export const killedAircraftIds = (faction: DcsJs.CampaignFaction, killedAircraftNames: Array<string>) => {
	const fgs = getFlightGroups(faction.packages);

	const ids: Array<string> = [];

	fgs.forEach((fg) => {
		fg.units.forEach((unit) => {
			if (killedAircraftNames.some((name) => name === unit.name)) {
				ids.push(unit.id);
			}
		});
	});

	return ids;
};

export const killedAircraftIdsByFlightGroups = (
	flightGroups: Array<DcsJs.CampaignFlightGroup>,
	killedAircraftNames: Array<string>,
) => {
	const ids: Array<string> = [];

	flightGroups.forEach((fg) => {
		fg.units.forEach((unit) => {
			if (killedAircraftNames.some((name) => name === unit.name)) {
				ids.push(unit.id);
			}
		});
	});

	return ids;
};

export const killedBuildingNames = (faction: DcsJs.CampaignFaction, killedGroundUnitNames: Array<string>) => {
	const ids: Array<string> = [];

	Object.values(faction.structures).forEach((structure) => {
		structure.buildings.forEach((building) => {
			if (killedGroundUnitNames.some((name) => name === building.name)) {
				ids.push(building.name);
			}
		});
	});

	return ids;
};

export const killedSamNames = (faction: DcsJs.CampaignFaction, killedGroundUnitNames: Array<string>) => {
	const names: Array<string> = [];

	faction.groundGroups.forEach((gg) => {
		if (Domain.Faction.isSamGroup(gg)) {
			// const trackRadars = sam.units.filter((unit) => unit.vehicleTypes.some((vt) => vt === "Track Radar"));
			const trackRadars: Array<DcsJs.GroundUnit> = [];
			gg.unitIds.forEach((id) => {
				const inventoryUnit = faction.inventory.groundUnits[id];
				if (inventoryUnit != null && inventoryUnit.vehicleTypes.some((vt) => vt === "Track Radar")) {
					trackRadars.push(inventoryUnit);
				}
			});

			const killed = trackRadars.some((radar) => killedGroundUnitNames.some((name) => name === radar.displayName));

			if (killed) {
				names.push(gg.name);
			}
		}
	});

	return names;
};

export const updateFactionState = (
	coalition: DcsJs.CampaignCoalition,
	faction: DcsJs.CampaignFaction,
	s: DcsJs.CampaignState,
	missionState: Types.Campaign.MissionState,
) => {
	const killedAircrafts = killedAircraftIds(faction, missionState.killed_aircrafts);
	const killedGroundUnits = killedGroundUnitIds(faction, missionState.killed_ground_units);

	killedAircrafts.forEach((id) => {
		const aircraft = faction.inventory.aircrafts[id];

		if (aircraft == null) {
			return;
		}

		aircraft.alive = false;
		aircraft.destroyedTime = s.timer;
	});

	killedGroundUnits.forEach((id) => {
		const inventoryUnit = faction.inventory.groundUnits[id];

		if (inventoryUnit == null) {
			return;
		}

		inventoryUnit.alive = false;
		inventoryUnit.destroyedTime = s.timer;
	});

	missionState.killed_ground_units.forEach((killedUnitName) => {
		const objectStructure = Object.values(faction.structures).find((structure) =>
			structure.buildings.some((building) => building.name === killedUnitName),
		);

		if (objectStructure == null) {
			return;
		}

		const structure = faction.structures[objectStructure.name];

		const building = structure?.buildings.find((building) => building.name === killedUnitName);

		if (building == null) {
			return;
		}

		building.alive = false;
		building.destroyedTime = s.timer;
	});

	faction.groundGroups.forEach((gg) => {
		if (Domain.Faction.isSamGroup(gg)) {
			if (gg.operational) {
				const trackRadarAlive = gg.unitIds.some((id) => {
					const inventoryUnit = faction.inventory.groundUnits[id];

					return (
						inventoryUnit != null &&
						inventoryUnit.alive &&
						inventoryUnit.vehicleTypes.some((vt) => vt === "Track Radar")
					);
				});

				if (trackRadarAlive) {
					return;
				}

				gg.operational = false;
			}
		}
	});

	faction.packages.forEach((pkg) => {
		pkg.flightGroups.forEach((fg) => {
			fg.units.forEach((unit) => {
				if (unit.client) {
					unit.client = false;
				}
			});

			const groupPosition = missionState.group_positions.find((gp) => gp.name === fg.name);

			if (groupPosition == null) {
				return;
			}

			fg.position = groupPosition;
		});
	});

	missionState.downed_pilots.forEach((pilot) => {
		if (pilot.coalition === 2 && coalition === "blue") {
			faction = createDownedPilot(pilot.name, pilot.time, { x: pilot.x, y: pilot.y }, coalition, faction, s);
		}

		if (pilot.coalition === 1 && coalition === "red") {
			faction = createDownedPilot(pilot.name, pilot.time, { x: pilot.x, y: pilot.y }, coalition, faction, s);
		}
	});
};
