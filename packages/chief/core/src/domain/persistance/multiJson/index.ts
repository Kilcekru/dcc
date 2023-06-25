import { z } from "zod";

import { MultiJson } from "./multiJson";

export const CampaignPersistance = new MultiJson({
	name: "campaign/campaign",
	version: 0,
	schema: {
		item: z.object({
			id: z.string(),
			created: z.coerce.date(),
		}),
		synopsis: z.object({}),
	},
	getSynopsis: () => ({}),
});
