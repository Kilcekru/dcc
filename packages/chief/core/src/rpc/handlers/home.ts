import { Home } from "@kilcekru/dcc-shared-rpc-types";
import { dialog } from "electron";

import { setApplicationMenu } from "../../app/menu";
import { mainWindow } from "../../app/startup";
import { userConfig } from "../../persistance";
import {
	findDcsPaths,
	findDcsSavedGamesPath,
	validateDcsInstallPath,
	validateDcsSavedGamesPath,
} from "../../utils/dcsPath";

async function setSetupComplete() {
	if (!userConfig.data.setupComplete) {
		userConfig.data.setupComplete = true;
		await userConfig.save();
		setApplicationMenu();
	}
}

const showOpenFileDialog: Home["showOpenFileDialog"] = async (args) => {
	if (mainWindow != undefined) {
		const res = await dialog.showOpenDialog(mainWindow, {
			title: args.title,
			properties: ["openDirectory", "dontAddToRecent"],
			defaultPath: args.defaultPath,
		});
		if (!res.canceled) {
			return res.filePaths[0];
		}
	}
	return undefined;
};

export const home: Home = {
	findDcsPaths,
	findDcsSavedGamesPath,
	setDcsPaths: async (paths) => {
		userConfig.data.dcs = {
			available: true,
			paths,
		};
		await userConfig.save();
		setApplicationMenu();
	},
	setDcsNotAvailable: async () => {
		userConfig.data.dcs = {
			available: false,
		};
		await userConfig.save();
		setApplicationMenu();
	},
	setSetupComplete,
	showOpenFileDialog,
	validateDcsInstallPath,
	validateDcsSavedGamesPath,
};
