import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-rpc-types";

import { MultiJson } from "./multiJson";

export const CampaignPersistance = new MultiJson({
	name: "campaign/campaign",
	version: 0,
	schema: {
		item: DcsJs.Schema.campaign,
		synopsis: Types.Schema.campaignSynopsis,
	},
	getSynopsis: (item) => ({
		id: item.id,
		factionName: item.blueFaction?.name ?? "",
		active: item.active,
		name: item.name,
		countryName: item.blueFaction?.countryName,
		created: item.created,
		edited: item.edited,
	}),
});
