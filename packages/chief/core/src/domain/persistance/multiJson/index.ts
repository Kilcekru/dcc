import * as DcsJs from "@foxdelta2/dcsjs";
import { z } from "zod";

import { MultiJson } from "./multiJson";

export const CampaignPersistance = new MultiJson({
	name: "campaign/campaign",
	version: 0,
	schema: {
		item: DcsJs.Schema.campaign,
		synopsis: z.object({
			id: z.string(),
			blueFaction: z.string(),
			name: z.string(),
		}),
	},
	getSynopsis: (item) => ({
		id: item.id,
		blueFaction: item.blueFaction?.name ?? "",
		name: item.name,
	}),
});
