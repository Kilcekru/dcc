import * as Types from "@kilcekru/dcc-shared-types";
import { app, shell } from "electron";
import * as os from "os";

import { config } from "../../config";
import * as Domain from "../../domain";

const getVersions: Types.Rpc.Misc["getVersions"] = async () => {
	return {
		os: `${os.platform() === "win32" ? "Windows" : "Unsuppoerted"} ${os.release()}`,
		app: app.getVersion(),
		electron: process.versions.electron,
		node: process.versions.node,
		chrome: process.versions.chrome,
	};
};

const getUserConfig: Types.Rpc.Misc["getUserConfig"] = async () => {
	return Domain.Persistance.State.userConfig.data;
};

const getSystemConfig: Types.Rpc.Misc["getSystemConfig"] = async () => {
	return config;
};

const openExternalLink: Types.Rpc.Misc["openExternalLink"] = async (url) => {
	await shell.openExternal(url);
};

export const misc: Types.Rpc.Misc = {
	getVersions,
	getUserConfig,
	getSystemConfig,
	loadApp: Domain.Window.loadApp,
	openExternalLink,
};
