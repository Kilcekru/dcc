import * as DcsJs from "@foxdelta2/dcsjs";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";

export type RunningCampaignState = Omit<CampaignState, "blueFaction" | "redFaction"> & {
	blueFaction: DcsJs.CampaignFaction;
	redFaction: DcsJs.CampaignFaction;
};
