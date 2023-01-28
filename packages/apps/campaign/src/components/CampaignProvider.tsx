import type * as DcsJs from "@foxdelta2/dcsjs";
import { CampaignState, DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createContext, createEffect, createUniqueId, JSX } from "solid-js";
import { createStore, produce } from "solid-js/store";

import { campaignRound, createCampaign, updateFactionState } from "../logic";
import { MissionState } from "../types";

type CampaignStore = [
	CampaignState,
	{
		activate?: (dataStore: DataStore, blueFactionName: string, redFactionName: string) => void;
		setMultiplier?: (multiplier: number) => void;
		tick?: (multiplier: number) => void;
		togglePause?: () => void;
		pause?: () => void;
		resume?: () => void;
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
		destroyStructure?: (objectiveName: string) => void;
		destroyAircraft?: (factionString: "blueFaction" | "redFaction", id: string) => void;
		selectFlightGroup?: (flightGroup: DcsJs.CampaignFlightGroup) => void;
		setClient?: (flightGroupId: string, count: number) => void;
		submitMissionState?: (state: MissionState) => void;
		saveCampaignRound?: (dataStore: DataStore) => void;
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
			activate(dataStore, blueFactionName, redFactionName) {
				setState(produce((s) => createCampaign(s, dataStore, blueFactionName, redFactionName)));
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
								return [...prev, ...fg.units.map((unit) => unit.id)];
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
							};
						});
					})
				);
			},
			saveCampaignRound(dataStore) {
				setState(produce((s) => campaignRound(s, dataStore)));
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
