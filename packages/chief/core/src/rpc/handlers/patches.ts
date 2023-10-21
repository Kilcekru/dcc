import * as Types from "@kilcekru/dcc-shared-types";

import * as Domain from "../../domain";

export const patches: Types.Rpc.Patches = {
	detectPatch: Domain.Patches.detectPatch,
	executePatches: async (args) => {
		await Domain.Patches.executePatches(args);
	},
	getPatchMode: async (id) => {
		return await Domain.Patches.getPatchMode(id);
	},
	setPatchModes: async (args) => {
		await Domain.Patches.setPatchModes(args);
	},
};
