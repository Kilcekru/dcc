import * as Types from "@kilcekru/dcc-shared-types";

import * as Domain from "../../domain";

export const patches: Types.Rpc.Patches = {
	detectPatch: Domain.Patches.detectPatch,
	executePatches: Domain.Patches.executePatches,
	executePatchOnQuit: async (id, action) => Domain.Patches.executePatchOnQuit(id, action),
};
