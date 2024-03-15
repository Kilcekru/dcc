import * as DcsJs from "@foxdelta2/dcsjs";
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
export type CreateCampaignStore = {
	currentScreen: (typeof Screens)[number];
	faction: DcsJs.Faction | undefined;
	enemyFaction: DcsJs.Faction | undefined;
	aiSkill: DcsJs.AiSkill;
	hardcore: boolean;
	training: boolean;
	nightMissions: boolean;
	badWeather: boolean;
	scenarioName: string | undefined;
};

const initState: CreateCampaignStore = {
	currentScreen: "Scenarios",
	faction: undefined,
	enemyFaction: undefined,
	aiSkill: "Average",
	hardcore: false,
	training: false,
	nightMissions: false,
	badWeather: false,
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
