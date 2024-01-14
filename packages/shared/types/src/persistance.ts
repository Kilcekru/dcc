import { z } from "zod";

import * as Campaign from "./campaign";

export namespace Schema {
	export const factions = z.object({
		factions: z.array(Campaign.Schema.faction),
		version: z.literal(1),
	});
}
