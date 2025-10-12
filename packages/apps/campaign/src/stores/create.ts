import type * as Types from "@kilcekru/dcc-shared-types";
import { createStore } from "@xstate/store";
import { produce } from "immer";

export type CreateCampaignStore = {
	scenario: Types.Campaign.Scenario | null;
	faction: Types.Campaign.Faction | null;
	oponentFaction: Types.Campaign.Faction | null;
};

export const createCampaignStore = createStore({
	context: {
		scenario: null,
		faction: null,
		oponentFaction: null,
	} as CreateCampaignStore,
	on: {
		setFaction: (context, { faction }: { faction: Types.Campaign.Faction | null }) =>
			produce(context, (draft) => {
				draft.faction = faction;
			}),
		setScenario: (context, { scenario }: { scenario: Types.Campaign.Scenario | null }) =>
			produce(context, (draft) => {
				draft.scenario = scenario;
			}),
		setOponentFaction: (context, { faction }: { faction: Types.Campaign.Faction | null }) =>
			produce(context, (draft) => {
				draft.oponentFaction = faction;
			}),
	},
});
