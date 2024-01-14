import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createContext, JSX } from "solid-js";
import { createStore } from "solid-js/store";

import { sendWorkerMessage } from "../worker";

export type ModalName = "next day" | "game over";

export type CampaignState = Types.Campaign.UIState & {
	active: boolean;
	paused: boolean;
	loaded: boolean;
	winner: DcsJs.Coalition | undefined;
	openModals: Set<ModalName>;
	selectedEntityId: undefined | Types.Campaign.Id;
};
type CampaignStore = [
	CampaignState,
	{
		stateUpdate?: (next: Types.Campaign.UIState) => void;
		timeUpdate?: (next: number) => void;
		deactivate?: () => void;
		activate?: () => void;
		selectEntity?: (id: Types.Campaign.Id) => void;
		clearSelectedEntity?: () => void;
		setMultiplier?: (multiplier: number) => void;
		tick?: (multiplier: number) => void;
		togglePause?: () => void;
		pause?: () => void;
		resume?: () => void;
		reset?: () => void;
		skipToNextDay?: () => void;
		closeModal?: (name: ModalName) => void;
	},
];

export const initState: CampaignState = {
	id: "",
	active: false,
	loaded: false,
	paused: true,
	name: "",
	time: 32400000,
	timeMultiplier: 1,
	flightGroups: [],
	entities: new Map(),
	selectedEntityId: undefined,
	factionDefinitions: {
		blue: undefined,
		red: undefined,
		neutrals: undefined,
	},
	theatre: "Caucasus",
	winner: undefined,
	campaignParams: {
		aiSkill: "Average",
		badWeather: false,
		hardcore: false,
		nightMissions: false,
		training: false,
	},
	openModals: new Set(),
	startTimeReached: false,
	hasClients: false,
	weather: {
		cloudCover: 0,
		cloudCoverData: [],
		offset: 0,
		temperature: 0,
		wind: {
			direction: 0,
			speed: 0,
		},
	},
};

export const CampaignContext = createContext<CampaignStore>([{ ...initState }, {}]);

export function CampaignProvider(props: { children?: JSX.Element }) {
	const [state, setState] = createStore<CampaignState>(initState);

	const store: CampaignStore = [
		state,
		{
			stateUpdate(next) {
				setState(next);
			},
			timeUpdate(next) {
				setState("time", next);
			},
			activate() {
				setState("active", true);
				setState("paused", false);
				setState("selectedEntityId", undefined);
			},
			setMultiplier(multiplier: number) {
				setState("timeMultiplier", multiplier);
			},
			togglePause() {
				setState("paused", (v) => {
					if (state.winner == null) {
						if (!v) {
							sendWorkerMessage({
								name: "pause",
							});
						} else {
							sendWorkerMessage({
								name: "resume",
								payload: { multiplier: state.timeMultiplier },
							});
						}
						return !v;
					}

					sendWorkerMessage({
						name: "pause",
					});
					return false;
				});
			},
			pause() {
				sendWorkerMessage({
					name: "pause",
				});
				setState("paused", () => true);
			},
			resume() {
				sendWorkerMessage({
					name: "resume",
					payload: { multiplier: state.timeMultiplier },
				});
				setState("paused", () => false);
				setState("selectedEntityId", undefined);
			},
			reset() {
				setState(initState);
				setState("loaded", true);
				setState("winner", undefined);
				setState("selectedEntityId", undefined);
			},

			deactivate() {
				setState("active", false);
			},
			selectEntity(id) {
				setState("selectedEntityId", () => id);
			},
			clearSelectedEntity() {
				setState("selectedEntityId", () => undefined);
			},
			skipToNextDay() {
				this.pause?.();

				sendWorkerMessage({
					name: "skipToNextDay",
				});

				setState("openModals", (v) => {
					const next = new Set(v);
					next.add("next day");
					return next;
				});
			},
			closeModal(name) {
				setState("openModals", (v) => {
					const next = new Set(v);
					next.delete(name);
					return next;
				});
			},
		},
	];

	return <CampaignContext.Provider value={store}>{props.children}</CampaignContext.Provider>;
}
