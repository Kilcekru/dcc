import type * as DcsJs from "@foxdelta2/dcsjs";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";

import { MissionState } from "../types";
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
			return [...prev, ...fg.units.map((unit) => unit.aircraftId)];
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

	return flightGroups.find((fg) => fg.units.some((unit) => unit.aircraftId === aircraftId));
};

export const updatePackagesState = (faction: DcsJs.CampaignFaction, timer: number) => {
	const cleanedFlightGroups = faction.packages.map((pkg) => {
		return {
			...pkg,
			flightGroups: pkg.flightGroups.filter((fg) => {
				const aliveAircrafts = fg.units.filter((unit) => {
					const ac = getAircraftFromId(faction.inventory.aircrafts, unit.aircraftId);

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
						states[unit.aircraftId] = getAircraftStateFromFlightGroup(fg, timer);
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
				ids.push(unit.aircraftId);
			}
		});
	});

	return ids;
};

export const updateFactionState = (
	faction: DcsJs.CampaignFaction,
	s: CampaignState,
	missionState: MissionState
): DcsJs.CampaignFaction => {
	const killedAircrafts = killedAircraftIds(faction, missionState.killed_aircrafts);

	return {
		...faction,
		inventory: {
			aircrafts: faction.inventory.aircrafts.map((ac) => {
				if (killedAircrafts.some((id) => ac.id === id)) {
					return {
						...ac,
						alive: false,
						destroyedTime: s.timer,
					};
				} else {
					return ac;
				}
			}),
			vehicles: faction.inventory.vehicles.map((vehicle) => {
				if (missionState.killed_ground_units.some((unitName) => unitName === vehicle.displayName)) {
					return {
						...vehicle,
						alive: false,
						destroyedTime: s.timer,
					};
				} else {
					return vehicle;
				}
			}),
		},
		sams: faction.sams.map((sam) => {
			const units = sam.units.map((unit) => {
				if (missionState.killed_ground_units.some((unitName) => unitName === unit.displayName)) {
					return {
						...unit,
						alive: false,
						destroyedTime: s.timer,
					};
				} else {
					return unit;
				}
			});

			return {
				...sam,
				units,
				operational:
					units.filter((unit) => unit.alive && unit.vehicleTypes.some((vt) => vt === "Track Radar")).length > 0,
			};
		}),
	};
};
