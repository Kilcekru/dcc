import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createContext, JSX, useContext } from "solid-js";
import { createStore, produce, SetStoreFunction } from "solid-js/store";

export const Screens = [
	"Scenarios",
	"Description",
	"Faction",
	"Enemy Faction",
	"Custom Faction",
	"Settings",
	"Balance Settings",
] as const;
export type Screen = (typeof Screens)[number];
export type CreateCampaignStore = {
	currentScreen: Screen;
	prevScreen: Screen | undefined;
	faction: Types.Campaign.Faction | undefined;
	enemyFaction: Types.Campaign.Faction | undefined;
	aiSkill: DcsJs.AiSkill;
	hardcore: boolean;
	training: boolean;
	nightMissions: boolean;
	badWeather: boolean;
	scenarioName: string | undefined;
	a2aLevel: number;
	shoradLevel: number;
	samActive: number;
};

export type CreateCampaignContext = [CreateCampaignStore, SetStoreFunction<CreateCampaignStore> | undefined];

const initState: CreateCampaignStore = {
	currentScreen: "Scenarios",
	prevScreen: undefined,
	faction: undefined,
	enemyFaction: undefined,
	aiSkill: "Average",
	hardcore: false,
	training: false,
	nightMissions: false,
	badWeather: true,
	scenarioName: "",
	a2aLevel: 2,
	shoradLevel: 2,
	samActive: 2,
};

export const CreateCampaignContext = createContext<CreateCampaignContext>([initState, undefined]);

export function CreateCampaignProvider(props: { children?: JSX.Element }) {
	const [store, setStore] = createStore(structuredClone(initState));

	return <CreateCampaignContext.Provider value={[store, setStore]}>{props.children}</CreateCampaignContext.Provider>;
}

export function useCreateCampaignStore() {
	return useContext(CreateCampaignContext)[0];
}

export function useSetCreateCampaignStore() {
	const setter = useContext(CreateCampaignContext)[1];

	if (setter == null) {
		throw new Error("CreateCampaignContext Setter not found");
	}

	return setter;
}

export function useSetScreen(next: Screen) {
	const setStore = useSetCreateCampaignStore();

	return () => {
		setStore(
			produce((draft) => {
				draft.prevScreen = draft.currentScreen;
				draft.currentScreen = next;
			}),
		);
	};
}
