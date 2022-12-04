import { Misc } from "@kilcekru/dcc-shared-rpc-types";

import { executeRpc } from "../utils";

export const misc: Misc = {
	getVersions: (...args: Parameters<Misc["getVersions"]>) =>
		executeRpc("misc", "getVersions", args) as ReturnType<Misc["getVersions"]>,
};
