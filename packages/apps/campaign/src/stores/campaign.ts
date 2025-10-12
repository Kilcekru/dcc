import type * as Types from "@kilcekru/dcc-shared-types";
import { createStore } from "@xstate/store";
import { produce } from "immer";

export type CampaignStore = {
	campaign: Types.Serialization.UIState | null;
	status: "loading" | "loaded" | "error" | "empty";
};

export const campaignStore = createStore({
	context: {
		campaign: null,
		status: "loading",
	} as CampaignStore,
	on: {
		update: (context, { campaign }: { campaign: Types.Serialization.UIState | null }) =>
			produce(context, (draft) => {
				draft.campaign = campaign;
			}),
		updateTime: (context, { time }: { time: number }) =>
			produce(context, (draft) => {
				draft.campaign =
					draft.campaign != null
						? {
								...draft.campaign,
								time: time,
							}
						: null;
			}),
	},
});
