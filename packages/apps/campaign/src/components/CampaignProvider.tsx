import type * as DcsJs from "@foxdelta2/dcsjs";
import { CampaignState, DataStore, MissionState } from "@kilcekru/dcc-shared-rpc-types";
import { createContext, createEffect, JSX } from "solid-js";
import { createStore, produce } from "solid-js/store";

import {
	campaignRound,
	createCampaign,
	deploymentScoreUpdate,
	missionRound,
	repairScoreUpdate,
	updateFactionState,
} from "../logic";
import { getClientMissionStartTime, getFlightGroups } from "../utils";

type CampaignStore = [
	CampaignState,
	{
		activate?: (
			dataStore: DataStore,
			blueFactionName: string,
			redFactionName: string,
			aiSkill: DcsJs.AiSkill,
			hardcore: boolean
		) => void;
		setMultiplier?: (multiplier: number) => void;
		tick?: (multiplier: number) => void;
		togglePause?: () => void;
		pause?: () => void;
		resume?: () => void;
		reset?: () => void;

		clearPackages?: (factionString: "blueFaction" | "redFaction") => void;
		updatePackagesState?: (factionString: "blueFaction" | "redFaction") => void;
		updateAircraftState?: () => void;
		destroySam?: (factionString: "blueFaction" | "redFaction", id: string) => void;
		destroyStructure?: (objectiveName: string) => void;
		selectFlightGroup?: (flightGroup: DcsJs.CampaignFlightGroup | undefined) => void;
		setClient?: (flightGroupId: string, count: number) => void;
		submitMissionState?: (state: MissionState, dataStore: DataStore) => void;
		saveCampaignRound?: (dataStore: DataStore) => void;
		updateDeploymentScore?: () => void;
		updateRepairScore?: () => void;
	}
];

export const initState: CampaignState = {
	active: false,
	loaded: false,
	campaignTime: new Date("2022-06-01").getTime(),
	timer: 32400,
	lastTickTimer: 32400,
	multiplier: 1,
	paused: false,
	selectedFlightGroup: undefined,
	blueFaction: undefined,
	redFaction: undefined,
	objectives: {},
	winningCondition: { type: "ground units" },
	aiSkill: "Average",
	name: "",
};

export const CampaignContext = createContext<CampaignStore>([{ ...initState }, {}]);

export function CampaignProvider(props: {
	children?: JSX.Element;
	campaignState: Partial<CampaignState> | null | undefined;
}) {
	const [state, setState] = createStore({ ...initState });

	const store: CampaignStore = [
		state,
		{
			activate(dataStore, blueFactionName, redFactionName, aiSkill, hardcore) {
				setState(produce((s) => createCampaign(s, dataStore, blueFactionName, redFactionName, aiSkill, hardcore)));
			},
			setMultiplier(multiplier: number) {
				setState("multiplier", multiplier);
			},
			tick(multiplier) {
				setState(
					produce((s) => {
						s.lastTickTimer = s.timer;

						const missionTimer = getClientMissionStartTime(s);

						const newTimer = s.timer + multiplier;

						if (missionTimer != null && newTimer > missionTimer) {
							s.timer = missionTimer;
						} else {
							s.timer = newTimer;
						}
					})
				);
			},
			togglePause() {
				setState("paused", (v) => {
					if (state.winner == null) {
						return !v;
					}

					return false;
				});
			},
			pause() {
				setState("paused", () => true);
			},
			resume() {
				setState("paused", () => false);
			},
			reset() {
				setState(initState);
				setState("loaded", true);
			},
			clearPackages(factionString) {
				setState(factionString, "packages", () => []);
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
			selectFlightGroup(flightGroup) {
				setState("selectedFlightGroup", () => flightGroup);
			},
			setClient(flightGroupId, count) {
				setState(
					produce((s) => {
						if (s.blueFaction == null) {
							return;
						}

						s.blueFaction.packages.forEach((pkg) => {
							const fg = pkg.flightGroups.find((fg) => fg.id === flightGroupId);

							if (fg == null) {
								return;
							}

							fg.units.forEach((unit, i) => {
								unit.client = i < count;
							});
						});
					})
				);
			},
			submitMissionState(state, dataStore) {
				setState(
					produce((s) => {
						s.timer = state.time;

						if (s.hardcore) {
							const fgs = getFlightGroups(s.blueFaction?.packages);
							const clientAircraftNames: Array<string> = [];

							fgs.forEach((fg) => {
								fg.units.filter((u) => u.client).forEach((u) => clientAircraftNames.push(u.name));
							});

							const clientKilled = state.killed_aircrafts.some((killedAc) =>
								clientAircraftNames.some((name) => name === killedAc)
							);

							if (clientKilled) {
								s.hardcore = "killed";
								s.winner = "red";
							}
						}

						if (s.blueFaction != null) {
							updateFactionState(s.blueFaction, s, state);
						}

						if (s.redFaction != null) {
							updateFactionState(s.redFaction, s, state);
						}

						missionRound(s, dataStore);
					})
				);
			},
			saveCampaignRound(dataStore) {
				setState(produce((s) => campaignRound(s, dataStore)));
			},
			updateDeploymentScore() {
				setState(produce((s) => deploymentScoreUpdate(s)));
			},
			updateRepairScore() {
				setState(produce((s) => repairScoreUpdate(s)));
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
