import type * as DcsJs from "@foxdelta2/dcsjs";
import { CampaignState, MissionState } from "@kilcekru/dcc-shared-rpc-types";

import { getFlightGroups } from "../utils";

export const findFlightGroupForAircraft = (faction: DcsJs.CampaignFaction, aircraftId: string) => {
	const flightGroups = getFlightGroups(faction.packages);

	return flightGroups.find((fg) => fg.units.some((unit) => unit.id === aircraftId));
};

export const killedGroundUnitIds = (faction: DcsJs.CampaignFaction, killedGroundUnitNames: Array<string>) => {
	const ids: Array<string> = [];

	Object.values(faction.inventory.groundUnits).forEach((unit) => {
		if (killedGroundUnitNames.some((name) => name === unit.displayName)) {
			ids.push(unit.id);
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

	faction.sams.forEach((sam) => {
		const trackRadars = sam.units.filter((unit) => unit.vehicleTypes.some((vt) => vt === "Track Radar"));

		const killed = trackRadars.some((radar) => killedGroundUnitNames.some((name) => name === radar.displayName));

		if (killed) {
			names.push(sam.name);
		}
	});

	return names;
};

export const updateFactionState = (faction: DcsJs.CampaignFaction, s: CampaignState, missionState: MissionState) => {
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
		const sam = faction.sams.find((sam) => sam.units.some((unit) => unit.displayName === killedUnitName));

		if (sam == null) {
			return;
		}

		const unit = sam.units.find((unit) => unit.displayName === killedUnitName);

		if (unit == null) {
			return;
		}

		unit.alive = false;
		unit.destroyedTime = s.timer;
	});

	missionState.killed_ground_units.forEach((killedUnitName) => {
		const objectStructure = Object.values(faction.structures).find((structure) =>
			structure.buildings.some((building) => building.name === killedUnitName)
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

	faction.sams.forEach((sam) => {
		if (sam.operational) {
			const trackRadarAlive = sam.units.some((u) => u.alive && u.vehicleTypes.some((vt) => vt === "Track Radar"));

			if (trackRadarAlive) {
				return;
			}

			sam.operational = false;
		}
	});

	faction.packages.forEach((pkg) => {
		pkg.flightGroups.forEach((fg) => {
			fg.units.forEach((unit) => {
				if (unit.client) {
					unit.client = false;
				}
			});
		});
	});
};
