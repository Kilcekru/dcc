import * as Types from "@kilcekru/dcc-shared-types";

import { rpc } from "../utils";

export const patches: Types.Rpc.Patches = {
	detectPatch: rpc<Types.Rpc.Patches["detectPatch"]>("patches", "detectPatch"),
	executePatches: rpc<Types.Rpc.Patches["executePatches"]>("patches", "executePatches"),
	executePatchOnQuit: rpc<Types.Rpc.Patches["executePatchOnQuit"]>("patches", "executePatchOnQuit"),
};
