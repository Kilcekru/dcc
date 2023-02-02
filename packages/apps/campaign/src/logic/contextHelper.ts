import type * as DcsJs from "@foxdelta2/dcsjs";
import { CampaignState, MissionState } from "@kilcekru/dcc-shared-rpc-types";

import {
	calcFlightGroupPosition,
	getAircraftFromId,
	getAircraftStateFromFlightGroup,
	getFlightGroups,
	Minutes,
} from "../utils";

export const cleanupPackages = (faction: DcsJs.CampaignFaction, timer: number) => {
	const finishedPackages = faction.packages.filter((pkg) => pkg.endTime <= timer);

	const usedAircraftIds = finishedPackages.reduce((prev, pkg) => {
		const fgAircraftIds = pkg.flightGroups.reduce((prev, fg) => {
			return [...prev, ...fg.units.map((unit) => unit.id)];
		}, [] as Array<string>);

		return [...prev, ...fgAircraftIds];
	}, [] as Array<string>);

	const updatedAircrafts = faction.inventory.aircrafts.map((aircraft) => {
		if (usedAircraftIds.some((id) => aircraft.id === id)) {
			return {
				...aircraft,
				state: "maintenance",
				maintenanceEndTime: timer + Minutes(60),
			} as DcsJs.CampaignAircraft;
		} else {
			return aircraft;
		}
	});

	const updatedPackages = faction.packages.filter((pkg) => pkg.endTime > timer);

	return {
		aircrafts: updatedAircrafts,
		packages: updatedPackages,
	};
};

export const findFlightGroupForAircraft = (faction: DcsJs.CampaignFaction, aircraftId: string) => {
	const flightGroups = getFlightGroups(faction.packages);

	return flightGroups.find((fg) => fg.units.some((unit) => unit.id === aircraftId));
};

export const updatePackagesState = (faction: DcsJs.CampaignFaction, timer: number) => {
	const cleanedFlightGroups = faction.packages.map((pkg) => {
		return {
			...pkg,
			flightGroups: pkg.flightGroups.filter((fg) => {
				const aliveAircrafts = fg.units.filter((unit) => {
					const ac = getAircraftFromId(faction.inventory.aircrafts, unit.id);

					return ac?.alive === true;
				});

				return aliveAircrafts.length > 0;
			}),
		};
	});

	const cleanedPackages = cleanedFlightGroups.filter((pkg) => pkg.flightGroups.length > 0);

	return cleanedPackages.map((pkg) => {
		return {
			...pkg,
			flightGroups: pkg.flightGroups.map((fg) => {
				const position = calcFlightGroupPosition(fg, timer, 170);

				if (position == null) {
					return fg;
				}

				return {
					...fg,
					position,
				};
			}),
		};
	});
};

export const updateAircraftState = (faction: DcsJs.CampaignFaction, timer: number) => {
	const aircrafts = faction.inventory.aircrafts.map((aircraft) => {
		if (
			aircraft.state === "maintenance" &&
			aircraft.maintenanceEndTime != null &&
			aircraft.maintenanceEndTime <= timer
		) {
			return {
				...aircraft,
				state: "idle",
				maintenanceEndTime: undefined,
			} as DcsJs.CampaignAircraft;
		} else if (aircraft.state === "en route" || aircraft.state === "rtb") {
			const fg = findFlightGroupForAircraft(faction, aircraft.id);

			if (fg == null) {
				return aircraft;
			}

			const position = calcFlightGroupPosition(fg, timer, 170);

			if (position == null) {
				return aircraft;
			}

			return { ...aircraft, position };
		} else {
			return aircraft;
		}
	});

	const aircraftState: Record<string, DcsJs.CampaignAircraftState | undefined> = faction.packages.reduce(
		(prev, pkg) => {
			return {
				...prev,
				...pkg.flightGroups.reduce((prev, fg) => {
					const states: Record<string, string | undefined> = {};
					fg.units.forEach((unit) => {
						states[unit.id] = getAircraftStateFromFlightGroup(fg, timer);
					});
					return { ...prev, ...states };
				}, {}),
			};
		},
		{}
	);

	return aircrafts.map((aircraft) => ({
		...aircraft,
		state: aircraftState[aircraft.id] ?? aircraft.state,
	}));
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

export const updateFactionState = (faction: DcsJs.CampaignFaction, s: CampaignState, missionState: MissionState) => {
	const killedAircrafts = killedAircraftIds(faction, missionState.killed_aircrafts);

	faction.inventory.aircrafts = faction.inventory.aircrafts.map((ac) => {
		if (killedAircrafts.some((id) => ac.id === id)) {
			return {
				...ac,
				alive: false,
				destroyedTime: s.timer,
			};
		} else {
			return ac;
		}
	});

	missionState.killed_ground_units.forEach((killedUnitName) => {
		const inventoryValue = Object.values(faction.inventory.groundUnits).find((u) => u.displayName === killedUnitName);

		if (inventoryValue == null) {
			return;
		}

		const inventoryUnit = faction.inventory.groundUnits[inventoryValue.id];

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

	faction.sams.forEach((sam) => {
		if (sam.operational) {
			const trackRadarAlive = sam.units.some((u) => u.alive && u.vehicleTypes.some((vt) => vt === "Track Radar"));

			if (trackRadarAlive) {
				return;
			}

			sam.operational = false;
		}
	});
};
