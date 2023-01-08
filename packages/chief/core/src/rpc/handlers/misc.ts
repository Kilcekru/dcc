import { Misc } from "@kilcekru/dcc-shared-rpc-types";

import { userConfig } from "../../persistance";

const getVersions: Misc["getVersions"] = async () => {
	return {
		electron: process.versions.electron,
		node: process.versions.node,
		chrome: process.versions.chrome,
	};
};

const getUserConfig: Misc["getUserConfig"] = async () => {
	return userConfig.data;
};

export const misc: Misc = {
	getVersions,
	getUserConfig,
};
