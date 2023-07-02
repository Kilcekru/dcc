import * as Types from "@kilcekru/dcc-shared-types";

import { rpc } from "../utils";

export const misc: Types.Rpc.Misc = {
	getVersions: rpc<Types.Rpc.Misc["getVersions"]>("misc", "getVersions"),
	getUserConfig: rpc<Types.Rpc.Misc["getUserConfig"]>("misc", "getUserConfig"),
	getSystemConfig: rpc<Types.Rpc.Misc["getSystemConfig"]>("misc", "getSystemConfig"),
	loadApp: rpc<Types.Rpc.Misc["loadApp"]>("misc", "loadApp"),
	openExternalLink: rpc<Types.Rpc.Misc["openExternalLink"]>("misc", "openExternalLink"),
};
