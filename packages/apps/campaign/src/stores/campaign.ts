import type * as Types from "@kilcekru/dcc-shared-types";
import { createStore } from "@xstate/store";
import { produce } from "immer";

export type ModalName = "next day" | "game over";

export type CampaignState = {
	uiState: Types.Serialization.UIState;
	paused: boolean;
};

export const initState: CampaignState = {
	uiState: {
		id: "",
		name: "",
		date: "2021-07-01",
		time: 32400000,
		timeMultiplier: 1,
		flightGroups: [],
		entities: new Map(),
		factionDefinitions: {
			blue: undefined,
			red: undefined,
			neutrals: undefined,
		},
		airdromes: {
			blue: new Set(),
			red: new Set(),
			neutrals: new Set(),
		},
		theatre: "Caucasus",
		campaignParams: {
			aiSkill: "Average",
			badWeather: false,
			hardcore: false,
			nightMissions: false,
			training: false,
			hotStart: false,
			samActive: "activeWithRepair",
			shoradLevel: "normal",
		},
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
	},
	paused: false,
};

export const campaignStore = createStore({
	context: {
		...initState,
		status: "loading",
	} as CampaignState,
	on: {
		update: (context, { uiState }: { uiState: Types.Serialization.UIState }) =>
			produce(context, (draft) => {
				draft.uiState = uiState;
			}),
		updateTime: (context, { time }: { time: number }) =>
			produce(context, (draft) => {
				draft.uiState.time = time;
			}),
		reset: () => initState,
	},
});
