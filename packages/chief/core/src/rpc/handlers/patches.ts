import * as Types from "@kilcekru/dcc-shared-types";

import * as Domain from "../../domain";

export const patches: Types.Rpc.Patches = {
	detectPatch: Domain.Patches.detectPatch,
	executePatches: async (execs) => {
		await Domain.Patches.executePatches(execs);
		await Domain.AppMenu.onConfigChanged();
	},
	executePatchOnQuit: async (id, action) => {
		Domain.Patches.executePatchOnQuit(id, action);
	},
};
