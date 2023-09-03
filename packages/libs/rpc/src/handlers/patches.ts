import * as Types from "@kilcekru/dcc-shared-types";

import { rpc } from "../utils";

export const patches: Types.Rpc.Patches = {
	detectPatch: rpc<Types.Rpc.Patches["detectPatch"]>("patches", "detectPatch"),
	applyPatches: rpc<Types.Rpc.Patches["applyPatches"]>("patches", "applyPatches"),
	clearPatches: rpc<Types.Rpc.Patches["clearPatches"]>("patches", "clearPatches"),
};
