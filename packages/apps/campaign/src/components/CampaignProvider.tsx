import {
	CampaignAircraft,
	CampaignAircraftState,
	CampaignCoalition,
	CampaignFaction,
	CampaignFlightGroup,
	CampaignObjective,
	CampaignState,
} from "@kilcekru/dcc-shared-rpc-types";
import { createContext, createEffect, createUniqueId, JSX } from "solid-js";
import { createStore, produce } from "solid-js/store";

import { getAircraftStateFromFlightGroup, Minutes } from "../utils";

const cleanupPackages = (faction: CampaignFaction, timer: number) => {
	const finishedPackages = faction.packages.filter((pkg) => pkg.endTime <= timer);

	const usedAircraftIds = finishedPackages.reduce((prev, pkg) => {
		const fgAircraftIds = pkg.flightGroups.reduce((prev, fg) => {
			return [...prev, ...fg.aircraftIds];
		}, [] as Array<string>);

		return [...prev, ...fgAircraftIds];
	}, [] as Array<string>);

	const updatedAircrafts = faction.inventory.aircrafts.map((aircraft) => {
		if (usedAircraftIds.some((id) => aircraft.id === id)) {
			return {
				...aircraft,
				state: "maintenance",
				maintenanceEndTime: timer + Minutes(60),
			} as CampaignAircraft;
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

const updateAircraftState = (faction: CampaignFaction, timer: number) => {
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
			} as CampaignAircraft;
		} else {
			return aircraft;
		}
	});

	const aircraftState: Record<string, CampaignAircraftState> = faction.packages.reduce((prev, pkg) => {
		return {
			...prev,
			...pkg.flightGroups.reduce((prev, fg) => {
				const states: Record<string, string> = {};
				fg.aircraftIds.forEach((id) => {
					states[id] = getAircraftStateFromFlightGroup(fg, timer);
				});
				return { ...prev, ...states };
			}, {}),
		};
	}, {});

	return aircrafts.map((aircraft) => ({
		...aircraft,
		state: aircraftState[aircraft.id] ?? aircraft.state,
	}));
};

type CampaignStore = [
	CampaignState,
	{
		activate?: (
			blueFaction: CampaignFaction,
			redFaction: CampaignFaction,
			objectives: Array<CampaignObjective>
		) => void;
		setMultiplier?: (multiplier: number) => void;
		tick?: (multiplier: number) => void;
		togglePause?: () => void;
		pause?: () => void;
		cleanupPackages?: () => void;
		addPackage?: (props: {
			coalition: CampaignCoalition;
			task: string;
			startTime: number;
			endTime: number;
			airdrome: string;
			flightGroups: Array<CampaignFlightGroup>;
		}) => void;
		clearPackages?: (factionString: "blueFaction" | "redFaction") => void;
		updateAircraftState?: () => void;
		updateActiveAircrafts?: (factionString: "blueFaction" | "redFaction", aircrafts: Array<CampaignAircraft>) => void;
		destroyUnit?: (factionString: "blueFaction" | "redFaction", objectiveName: string, unitId: string) => void;
	}
];

const initState: CampaignState = {
	active: false,
	timer: 0,
	multiplier: 1,
	paused: false,
	blueFaction: undefined,
	redFaction: undefined,
	objectives: [],
};

export const CampaignContext = createContext<CampaignStore>([initState, {}]);

export function CampaignProvider(props: {
	children?: JSX.Element;
	campaignState: Partial<CampaignState> | null | undefined;
}) {
	const [state, setState] = createStore(initState);

	const store: CampaignStore = [
		state,
		{
			activate(blueFaction, redFaction, objectives) {
				setState(
					produce((s) => {
						s.active = true;
						s.blueFaction = blueFaction;
						s.redFaction = redFaction;
						s.objectives = objectives;
					})
				);
			},
			setMultiplier(multiplier: number) {
				setState("multiplier", multiplier);
			},
			tick(multiplier) {
				setState("timer", (prev) => prev + multiplier);
			},
			togglePause() {
				setState("paused", (v) => !v);
			},
			pause() {
				setState("paused", () => true);
			},
			cleanupPackages() {
				setState(
					produce((s) => {
						if (s.blueFaction != null) {
							const update = cleanupPackages(s.blueFaction, s.timer);

							s.blueFaction.inventory.aircrafts = update.aircrafts;
							s.blueFaction.packages = update.packages;
						}

						if (s.redFaction != null) {
							const update = cleanupPackages(s.redFaction, s.timer);

							s.redFaction.inventory.aircrafts = update.aircrafts;
							s.redFaction.packages = update.packages;
						}
					})
				);
			},
			updateAircraftState() {
				setState(
					produce((s) => {
						if (s.blueFaction != null) {
							s.blueFaction.inventory.aircrafts = updateAircraftState(s.blueFaction, s.timer);
						}

						if (s.redFaction != null) {
							s.redFaction.inventory.aircrafts = updateAircraftState(s.redFaction, s.timer);
						}
					})
				);
			},
			addPackage({ coalition, task, startTime, endTime, airdrome, flightGroups }) {
				setState(
					produce((s) => {
						const faction = coalition === "blue" ? s.blueFaction : coalition === "red" ? s.redFaction : undefined;
						if (faction != null) {
							faction.packages.push({
								endTime,
								id: createUniqueId(),
								startTime,
								task,
								airdrome,
								flightGroups,
							});

							if (coalition === "blue") {
								s.blueFaction = faction;
							} else if (coalition === "red") {
								s.redFaction = faction;
							}
						}
					})
				);
			},
			clearPackages(factionString) {
				setState(factionString, "packages", () => []);
			},
			updateActiveAircrafts(factionString, aircrafts) {
				setState(factionString, "inventory", "aircrafts", (acs) =>
					acs.map((ac) => {
						const updatedAircraft = aircrafts.find((a) => a.id === ac.id);

						if (updatedAircraft == null) {
							return ac;
						} else {
							return updatedAircraft;
						}
					})
				);
			},
			destroyUnit(factionString, objectiveName, unitId) {
				setState(factionString, "inventory", "vehicles", (vehicles) =>
					vehicles.map((vehicle) => {
						if (vehicle.id === unitId) {
							return { ...vehicle, alive: false, destroyedTime: state.timer };
						} else {
							return vehicle;
						}
					})
				);
				setState(
					produce((s) => {
						s.objectives = s?.objectives.map((obj) => {
							if (obj.name === objectiveName) {
								const units = obj.units.map((unit) => {
									if (unit.id === unitId) {
										return {
											...unit,
											alive: false,
											destroyedTime: s.timer,
										};
									} else {
										return unit;
									}
								});

								const objectiveIsNeutral = units.filter((u) => u.alive === true).length === 0;

								return {
									...obj,
									coalition: objectiveIsNeutral ? "neutral" : obj.coalition,
									units,
								};
							} else {
								return obj;
							}
						});
					})
				);
			},
		},
	];

	createEffect(() =>
		setState((state) => {
			if (props.campaignState == null) {
				return state;
			} else {
				return { ...state, ...props.campaignState };
			}
		})
	);

	return <CampaignContext.Provider value={store}>{props.children}</CampaignContext.Provider>;
}
