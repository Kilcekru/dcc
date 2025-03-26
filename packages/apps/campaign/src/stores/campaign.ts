import { createStore } from "@kilcekru/dcc-lib-components";
import type * as Types from "@kilcekru/dcc-shared-types";

export type CampaignStore = {
	campaign: Types.Serialization.UIState | null;
	status: "loading" | "loaded" | "error" | "empty";
};

export const campaignStore = createStore<CampaignStore>({
	campaign: null,
	status: "loading",
});

(window as any).store = campaignStore;
