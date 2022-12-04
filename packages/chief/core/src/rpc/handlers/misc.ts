import { Misc } from "@kilcekru/dcc-shared-rpc-types";

const getVersions: Misc["getVersions"] = async () => {
	return {
		electron: process.versions.electron,
		node: process.versions.node,
		chrome: process.versions.chrome,
	};
};

export const misc: Misc = {
	getVersions,
};
