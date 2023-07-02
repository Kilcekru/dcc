import { Misc } from "@kilcekru/dcc-shared-types";
import { app, shell } from "electron";
import * as os from "os";

import { loadApp } from "../../app/startup";
import { config } from "../../config";
import * as Domain from "../../domain";

const getVersions: Misc["getVersions"] = async () => {
	return {
		os: `${os.platform() === "win32" ? "Windows" : "Unsuppoerted"} ${os.release()}`,
		app: app.getVersion(),
		electron: process.versions.electron,
		node: process.versions.node,
		chrome: process.versions.chrome,
	};
};

const getUserConfig: Misc["getUserConfig"] = async () => {
	return Domain.Persistance.State.userConfig.data;
};

const getSystemConfig: Misc["getSystemConfig"] = async () => {
	return config;
};

const openExternalLink: Misc["openExternalLink"] = async (url) => {
	await shell.openExternal(url);
};

export const misc: Misc = {
	getVersions,
	getUserConfig,
	getSystemConfig,
	loadApp,
	openExternalLink,
};
