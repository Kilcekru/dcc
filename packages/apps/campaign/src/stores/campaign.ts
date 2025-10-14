import * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import { createStoreWithProducer } from "@xstate/store";
import { produce } from "immer";

export type ModalName = "next day" | "game over";

export type CampaignState = Omit<Types.Serialization.UIState, "missionId"> & {
	active: boolean;
	paused: boolean;
	winner: DcsJs.Coalition | undefined;
	missionId: string | undefined;
	status: "loading" | "loaded" | "error" | "empty";
};

export const initState: CampaignState = {
	id: "",
	active: false,
	status: "empty",
	paused: false,
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
	winner: undefined,
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
	missionId: undefined,
};

export const campaignStore = createStoreWithProducer(produce, {
	context: {
		...initState,
		status: "loading",
	} as CampaignState,
	on: {
		update: (context, { uiState }: { uiState: Types.Serialization.UIState }) => {
			context = {
				...context,
				...uiState,
			};
		},

		updateTime: (context, { time }: { time: number }) => {
			context = {
				...context,
				time: time,
			};
		},
		reset: () => initState,
	},
});
