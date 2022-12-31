import { Campaign } from "@kilcekru/dcc-shared-rpc-types";

import { executeRpc } from "../utils";

export const campaign: Campaign = {
	save: (...args: Parameters<Campaign["save"]>) => executeRpc("campaign", "save", args) as ReturnType<Campaign["save"]>,
	load: (...args: Parameters<Campaign["load"]>) => executeRpc("campaign", "load", args) as ReturnType<Campaign["load"]>,
};
