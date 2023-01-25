import type * as DcsJs from "@foxdelta2/dcsjs";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { createContext, createEffect, createUniqueId, JSX } from "solid-js";
import { createStore, produce } from "solid-js/store";

import { cleanupPackages, updateAircraftState, updateFactionState, updatePackagesState } from "../logic2";
import { MissionState } from "../types";
import { random } from "../utils";

type CampaignStore = [
	CampaignState,
	{
		activate?: (
			blueFaction: DcsJs.CampaignFaction,
			redFaction: DcsJs.CampaignFaction,
			objectives: Array<DcsJs.CampaignObjective>,
			farps: Array<DcsJs.CampaignFarp>
		) => void;
		setMultiplier?: (multiplier: number) => void;
		tick?: (multiplier: number) => void;
		togglePause?: () => void;
		pause?: () => void;
		resume?: () => void;
		cleanupPackages?: () => void;
		addPackage?: (props: {
			coalition: DcsJs.CampaignCoalition;
			task: DcsJs.Task;
			startTime: number;
			endTime: number;
			airdrome: string;
			flightGroups: Array<DcsJs.CampaignFlightGroup>;
		}) => void;
		clearPackages?: (factionString: "blueFaction" | "redFaction") => void;
		updatePackagesState?: (factionString: "blueFaction" | "redFaction") => void;
		updateAircraftState?: () => void;
		updateActiveAircrafts?: (
			factionString: "blueFaction" | "redFaction",
			aircrafts: Array<DcsJs.CampaignAircraft>
		) => void;
		destroySam?: (factionString: "blueFaction" | "redFaction", id: string) => void;
		destroyUnit?: (factionString: "blueFaction" | "redFaction", objectiveName: string, unitId: string) => void;
		destroyStructure?: (objectiveName: string) => void;
		destroyAircraft?: (factionString: "blueFaction" | "redFaction", id: string) => void;
		selectFlightGroup?: (flightGroup: DcsJs.CampaignFlightGroup) => void;
		setClient?: (flightGroupId: string, count: number) => void;
		submitMissionState?: (state: MissionState) => void;
		updateFrontline?: () => void;
		saveCampaignRound?: (updatedState: CampaignState) => void;
	}
];

const initState: CampaignState = {
	active: false,
	campaignTime: new Date("2022-06-01").getTime(),
	timer: 32400,
	multiplier: 1,
	paused: false,
	selectedFlightGroup: undefined,
	blueFaction: undefined,
	redFaction: undefined,
	objectives: [],
	farps: [],
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
			activate(blueFaction, redFaction, objectives, farps) {
				setState(
					produce((s) => {
						s.active = true;
						s.blueFaction = blueFaction;
						s.redFaction = redFaction;
						s.objectives = objectives;
						s.farps = farps;
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
			resume() {
				setState("paused", () => false);
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
			updatePackagesState(factionString) {
				setState(
					produce((s) => {
						if (factionString === "blueFaction" && s.blueFaction != null) {
							s.blueFaction.packages = updatePackagesState(s.blueFaction, s.timer);
						}

						if (factionString === "redFaction" && s.redFaction != null) {
							s.redFaction.packages = updatePackagesState(s.redFaction, s.timer);
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
			addPackage({ coalition, task, startTime, endTime, flightGroups }) {
				setState(
					produce((s) => {
						const faction = coalition === "blue" ? s.blueFaction : coalition === "red" ? s.redFaction : undefined;
						if (faction != null) {
							faction.packages.push({
								endTime,
								id: createUniqueId(),
								startTime,
								task,
								flightGroups,
							});

							const aircraftIds = flightGroups.reduce((prev, fg) => {
								return [...prev, ...fg.units.map((unit) => unit.aircraftId)];
							}, [] as Array<string>);

							faction["inventory"]["aircrafts"] = faction["inventory"]["aircrafts"].map((ac) => {
								if (aircraftIds.some((id) => ac.id === id)) {
									return {
										...ac,
										state: "en route",
									};
								} else {
									return ac;
								}
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
			destroySam(factionString, samId) {
				setState(factionString, "sams", (sams) =>
					sams.map((sam) => {
						if (sam.id === samId) {
							return {
								...sam,
								operational: false,
								units: sam.units.map((unit) => {
									if (unit.vehicleTypes.some((vt) => vt === "Track Radar" || vt === "Search Radar")) {
										return {
											...unit,
											alive: false,
											destroyedTime: state.timer,
										};
									} else {
										return unit;
									}
								}),
							};
						} else {
							return sam;
						}
					})
				);
			},
			destroyStructure(objectiveName) {
				setState(
					produce((s) => {
						s.objectives = s?.objectives.map((obj) => {
							if (obj.name === objectiveName) {
								return {
									...obj,
									structures: obj.structures.map((str) => ({ ...str, alive: false, destroyedTime: s.timer })),
								};
							} else {
								return obj;
							}
						});
					})
				);
			},
			destroyAircraft(factionString, id) {
				setState(factionString, "inventory", "aircrafts", (acs) =>
					acs.map((ac) => {
						if (ac.id === id) {
							return {
								...ac,
								alive: false,
								destroyedTime: state.timer,
							};
						} else {
							return ac;
						}
					})
				);
			},
			selectFlightGroup(flightGroup) {
				setState("selectedFlightGroup", () => flightGroup);
			},
			setClient(flightGroupId, count) {
				setState(
					produce((s) => {
						if (s.blueFaction == null) {
							return;
						}

						s.blueFaction.packages = s.blueFaction.packages.map((pkg) => {
							const hasFg = pkg.flightGroups.some((fg) => fg.id === flightGroupId);

							if (hasFg) {
								return {
									...pkg,
									flightGroups: pkg.flightGroups.map((fg) => {
										if (fg.id === flightGroupId) {
											return {
												...fg,
												units: fg.units.map((unit, i) => {
													if (i < count) {
														return { ...unit, client: true };
													} else {
														return unit;
													}
												}),
											};
										} else {
											return fg;
										}
									}),
								};
							} else {
								return pkg;
							}
						});
					})
				);
			},
			submitMissionState(state) {
				setState(
					produce((s) => {
						s.timer = state.time;

						if (s.blueFaction != null) {
							s.blueFaction = updateFactionState(s.blueFaction, s, state);
						}

						if (s.redFaction != null) {
							s.redFaction = updateFactionState(s.redFaction, s, state);
						}

						s.objectives = s.objectives.map((obj) => {
							return {
								...obj,
								structures: obj.structures.map((structure) => {
									if (state.killed_ground_units.some((unitName) => unitName === structure.name)) {
										return {
											...structure,
											alive: false,
											destroyedTime: s.timer,
										};
									} else {
										return structure;
									}
								}),
								units: obj.units.map((unit) => {
									if (state.killed_ground_units.some((unitName) => unitName === unit.displayName)) {
										return {
											...unit,
											alive: false,
											destroyedTime: s.timer,
										};
									} else {
										return unit;
									}
								}),
							};
						});
					})
				);
			},
			updateFrontline() {
				setState(
					produce((s) => {
						if (s.objectives.some((obj) => obj.coalition === "neutral")) {
							const faction = s.blueFaction;
							if (faction == null || s.blueFaction == null) {
								return;
							}

							let vehicles = faction.inventory.vehicles;
							s.objectives = s.objectives.map((obj) => {
								if (obj.coalition === "neutral") {
									const units = vehicles
										.filter((vehicle) => vehicle.alive && vehicle.state === "idle")
										.slice(0, random(4, 8));

									vehicles = vehicles.map((vehicle) => {
										if (units.some((unit) => unit.id === vehicle.id)) {
											return {
												...vehicle,
												state: "on objective",
											};
										} else {
											return vehicle;
										}
									});

									return {
										...obj,
										coalition: "blue",
										units,
									};
								} else {
									return obj;
								}
							});

							s.blueFaction.inventory.vehicles = vehicles;
						}
					})
				);
			},
			saveCampaignRound(updatedState) {
				setState(() => updatedState);
				/* setState(
					produce((s) => {
						console.log("saveCampaignRound", { store: s.blueFaction, update: updatedState.blueFaction });
						s.blueFaction = updatedState.blueFaction;
					})
				); */
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
