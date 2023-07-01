import type * as DcsJs from "@foxdelta2/dcsjs";

export type RunningCampaignState = Omit<DcsJs.CampaignState, "blueFaction" | "redFaction"> & {
	blueFaction: DcsJs.CampaignFaction;
	redFaction: DcsJs.CampaignFaction;
};
