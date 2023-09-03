import * as Types from "@kilcekru/dcc-shared-types";

import * as Domain from "../../domain";

export const patches: Types.Rpc.Patches = {
	detectPatch: Domain.Patches.detectPatch,
	applyPatches: Domain.Patches.applyPatches,
	clearPatches: Domain.Patches.clearPatches,
};
