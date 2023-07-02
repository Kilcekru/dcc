import { Misc } from "@kilcekru/dcc-shared-types";

import { rpc } from "../utils";

export const misc: Misc = {
	getVersions: rpc<Misc["getVersions"]>("misc", "getVersions"),
	getUserConfig: rpc<Misc["getUserConfig"]>("misc", "getUserConfig"),
	getSystemConfig: rpc<Misc["getSystemConfig"]>("misc", "getSystemConfig"),
	loadApp: rpc<Misc["loadApp"]>("misc", "loadApp"),
	openExternalLink: rpc<Misc["openExternalLink"]>("misc", "openExternalLink"),
};
