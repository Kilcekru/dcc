import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createContext, JSX, useContext } from "solid-js";
import { createMutable } from "solid-js/store";

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
};

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
};

export const CreateCampaignContext = createContext<CreateCampaignStore>(initState);

export function CreateCampaignProvider(props: { children?: JSX.Element }) {
	const state = createMutable(structuredClone(initState));

	return <CreateCampaignContext.Provider value={state}>{props.children}</CreateCampaignContext.Provider>;
}

export function useCreateCampaignStore() {
	return useContext(CreateCampaignContext);
}
