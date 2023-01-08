import { Launcher } from "@kilcekru/dcc-shared-rpc-types";

import { userConfig } from "../../persistance";
import {
	findDcsPaths,
	findDcsSavedGamesPath,
	validateDcsInstallPath,
	validateDcsSavedGamesPath,
} from "../../utils/dcsPath";

export const launcher: Launcher = {
	findDcsPaths,
	findDcsSavedGamesPath,
	validateDcsInstallPath,
	validateDcsSavedGamesPath,
	setDcsPaths: async (paths) => {
		userConfig.data.dcs = {
			available: true,
			paths,
		};
		await userConfig.save();
	},
	setDcsNotAvailable: async () => {
		userConfig.data.dcs = {
			available: false,
		};
		await userConfig.save();
	},
};
