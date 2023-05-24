import { Misc } from "@kilcekru/dcc-shared-rpc-types";

import { rpc } from "../utils";

export const misc: Misc = {
	getVersions: rpc<Misc["getVersions"]>("misc", "getVersions"),
	getUserConfig: rpc<Misc["getUserConfig"]>("misc", "getUserConfig"),
	getSystemConfig: rpc<Misc["getSystemConfig"]>("misc", "getSystemConfig"),
	loadApp: rpc<Misc["loadApp"]>("misc", "loadApp"),
};
