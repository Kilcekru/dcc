import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createContext, createEffect, JSX } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { v4 as uuid } from "uuid";

import { Config, scenarioList } from "../data";
import {
	campaignRound,
	clearPackages,
	createCampaign,
	deploymentScoreUpdate,
	missionRound,
	repairScoreUpdate,
	updateFactionState,
} from "../logic";
import { dateToTimer, getClientMissionStartTime, getFlightGroups, getMissionStateTimer, timerToDate } from "../utils";

type CampaignStore = [
	DcsJs.CampaignState,
	{
		activate?: (
			dataStore: Types.Campaign.DataStore,
			blueFaction: DcsJs.Faction,
			redFaction: DcsJs.Faction,
			aiSkill: DcsJs.AiSkill,
			hardcore: boolean,
			nightMissions: boolean,
			scenario: string
		) => void;
		setMultiplier?: (multiplier: number) => void;
		tick?: (multiplier: number) => void;
		togglePause?: () => void;
		pause?: () => void;
		resume?: () => void;
		reset?: () => void;

		updatePackagesState?: (factionString: "blueFaction" | "redFaction") => void;
		updateAircraftState?: () => void;
		destroyStructure?: (objectiveName: string) => void;
		selectFlightGroup?: (flightGroup: DcsJs.CampaignFlightGroup | undefined) => void;
		setClient?: (flightGroupId: string, count: number) => void;
		submitMissionState?: (state: Types.Campaign.MissionState, dataStore: Types.Campaign.DataStore) => void;
		saveCampaignRound?: (dataStore: Types.Campaign.DataStore) => void;
		updateDeploymentScore?: () => void;
		updateRepairScore?: () => void;
		skipToNextDay?: () => void;
		resumeNextDay?: () => void;
		generateMissionId?: () => void;
		resetMissionId?: () => void;
		clearToastMessages?: (ids: Array<string>) => void;
		replaceCampaignState?: (next: DcsJs.CampaignState) => void;
		closeCampaign?: () => void;
	}
];

export const initState: DcsJs.CampaignState = {
	id: "",
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
	nextDay: false,
	allowNightMissions: false,
	missionId: undefined,
	toastMessages: [],
	map: "caucasus",
	created: new Date(),
	edited: new Date(),
};

export const CampaignContext = createContext<CampaignStore>([{ ...initState }, {}]);

export function CampaignProvider(props: {
	children?: JSX.Element;
	campaignState: Partial<DcsJs.CampaignState> | null | undefined;
}) {
	const [state, setState] = createStore<DcsJs.CampaignState>(structuredClone(initState) as DcsJs.CampaignState);

	const store: CampaignStore = [
		state,
		{
			activate(dataStore, blueFaction, redFaction, aiSkill, hardcore, nightMissions, scenarioName) {
				const scenario = scenarioList.find((sc) => sc.name === scenarioName);
				const newState = createCampaign(
					structuredClone(initState) as DcsJs.CampaignState,
					dataStore,
					blueFaction,
					redFaction,
					aiSkill,
					hardcore,
					nightMissions,
					scenarioName
				);
				newState.map = (scenario?.map ?? "caucasus") as DcsJs.MapName;
				setState(newState);
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
				setState("winner", undefined);
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
						s.missionId = undefined;
					})
				);
			},
			submitMissionState(state, dataStore) {
				setState(
					produce((s) => {
						s.timer = getMissionStateTimer(state, s.timer);
						s.missionId = undefined;

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
			skipToNextDay() {
				setState(
					produce((s) => {
						s.paused = true;
						s.nextDay = true;

						const d = timerToDate(s.timer);
						d.setUTCDate(d.getUTCDate() + 1);
						d.setUTCHours(Config.night.endHour);
						d.setUTCMinutes(0);
						d.setUTCSeconds(0);

						s.timer = dateToTimer(d);

						if (s.blueFaction) {
							clearPackages(s.blueFaction);

							s.blueFaction.groundGroups = s.blueFaction.groundGroups.filter((gg) => gg.state === "on objective");
						}

						if (s.redFaction) {
							clearPackages(s.redFaction);

							s.redFaction.groundGroups = s.redFaction.groundGroups.filter((gg) => gg.state === "on objective");
						}

						Object.values(s.objectives).forEach((obj) => {
							const storeObjective = s.objectives[obj.name];

							if (storeObjective == null) {
								return;
							}

							storeObjective.incomingGroundGroups = {};
						});
					})
				);
			},
			resumeNextDay() {
				setState("nextDay", () => false);
				setState("paused", () => false);
			},
			generateMissionId() {
				setState("missionId", uuid());
			},
			resetMissionId() {
				setState("missionId", undefined);
			},
			clearToastMessages(ids) {
				setState("toastMessages", (s) => s.filter((msg) => !ids.some((id) => id === msg.id)));
			},
			replaceCampaignState(next) {
				setState({
					...next,
					active: true,
				});
			},
			closeCampaign() {
				setState("active", false);
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
