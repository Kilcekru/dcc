import {
	CampaignAircraft,
	CampaignAircraftState,
	CampaignCoalition,
	CampaignFlightGroup,
	CampaignObjective,
	CampaignState,
	FactionData,
} from "@kilcekru/dcc-shared-rpc-types";
import { createContext, createEffect, createUniqueId, JSX } from "solid-js";
import { createStore, produce } from "solid-js/store";

import { getAircraftStateFromFlightGroup, Minutes } from "../utils";

type CampaignStore = [
	CampaignState,
	{
		activate?: (blueFaction: FactionData, redFaction: FactionData, objectives: Array<CampaignObjective>) => void;
		setMultiplier?: (multiplier: number) => void;
		tick?: (multiplier: number) => void;
		togglePause?: () => void;
		cleanupPackages?: () => void;
		addPackage?: (props: {
			coalition: CampaignCoalition;
			task: string;
			startTime: number;
			endTime: number;
			airdrome: string;
			flightGroups: Array<CampaignFlightGroup>;
		}) => void;
		clearPackages?: () => void;
		updateAircraftState?: () => void;
		updateActiveAircrafts?: (aircrafts: Array<CampaignAircraft>) => void;
		destroyUnit?: (side: "blue" | "red", objectiveName: string, unitId: string) => void;
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
			cleanupPackages() {
				setState(
					produce((s) => {
						if (s.blueFaction != null) {
							const finishedPackages = s.blueFaction?.packages.filter((pkg) => pkg.endTime <= state.timer);

							const usedAircraftIds = finishedPackages.reduce((prev, pkg) => {
								const fgAircraftIds = pkg.flightGroups.reduce((prev, fg) => {
									return [...prev, ...fg.aircraftIds];
								}, [] as Array<string>);

								return [...prev, ...fgAircraftIds];
							}, [] as Array<string>);

							s.blueFaction.activeAircrafts = s.blueFaction.activeAircrafts.map((aircraft) => {
								if (usedAircraftIds.some((id) => aircraft.id === id)) {
									return {
										...aircraft,
										state: "maintenance",
										maintenanceEndTime: s.timer + Minutes(60),
									};
								} else {
									return aircraft;
								}
							});

							s.blueFaction.packages = s.blueFaction.packages.filter((pkg) => pkg.endTime > state.timer);
						}
					})
				);
			},
			updateAircraftState() {
				setState(
					produce((s) => {
						if (s.blueFaction != null) {
							let aircrafts = s.blueFaction.activeAircrafts.map((aircraft) => {
								if (
									aircraft.state === "maintenance" &&
									aircraft.maintenanceEndTime != null &&
									aircraft.maintenanceEndTime <= s.timer
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

							const aircraftState: Record<string, CampaignAircraftState> = s.blueFaction.packages.reduce(
								(prev, pkg) => {
									return {
										...prev,
										...pkg.flightGroups.reduce((prev, fg) => {
											const states: Record<string, string> = {};
											fg.aircraftIds.forEach((id) => {
												states[id] = getAircraftStateFromFlightGroup(fg, s.timer);
											});
											return { ...prev, ...states };
										}, {}),
									};
								},
								{}
							);

							aircrafts = aircrafts.map((aircraft) => ({
								...aircraft,
								state: aircraftState[aircraft.id] ?? aircraft.state,
							}));

							s.blueFaction.activeAircrafts = aircrafts;
						}
					})
				);
			},
			addPackage({ coalition, task, startTime, endTime, airdrome, flightGroups }) {
				setState(
					produce((s) => {
						const faction = coalition === "blue" ? s.blueFaction : coalition === "red" ? s.redFaction : undefined;
						if (faction != null) {
							const usedAircraftIds = flightGroups.reduce((prev, fg) => {
								return [...prev, ...fg.aircraftIds];
							}, [] as Array<string>);

							faction.activeAircrafts = faction.activeAircrafts.map((aircraft) => {
								if (usedAircraftIds.some((id) => aircraft.id === id)) {
									return {
										...aircraft,
										state: "en route",
									};
								} else {
									return aircraft;
								}
							});

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
			clearPackages() {
				setState("blueFaction", "packages", () => []);
			},
			updateActiveAircrafts(aircrafts) {
				setState("blueFaction", "activeAircrafts", (acs) =>
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
			destroyUnit(side, objectiveName, unitId) {
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
