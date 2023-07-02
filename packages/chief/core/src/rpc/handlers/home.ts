import { Home } from "@kilcekru/dcc-shared-rpc-types";
import { dialog } from "electron";
import FS from "fs-extra";

import { setApplicationMenu } from "../../app/menu";
import { mainWindow } from "../../app/startup";
import * as Domain from "../../domain";
import {
	findDcsPaths,
	findDcsSavedGamesPath,
	validateDcsInstallPath,
	validateDcsSavedGamesPath,
} from "../../utils/dcsPath";
import { createSupportZip } from "../../utils/supportZip";

async function setSetupComplete() {
	if (!Domain.Persistance.State.userConfig.data.setupComplete) {
		Domain.Persistance.State.userConfig.data.setupComplete = true;
		await Domain.Persistance.State.userConfig.save();
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
		Domain.Persistance.State.userConfig.data.dcs = {
			available: true,
			paths,
		};
		await Domain.Persistance.State.userConfig.save();
		setApplicationMenu();
	},
	setDcsNotAvailable: async () => {
		Domain.Persistance.State.userConfig.data.dcs = {
			available: false,
		};
		await Domain.Persistance.State.userConfig.save();
		setApplicationMenu();
	},
	setSetupComplete,
	showOpenFileDialog,
	validateDcsInstallPath,
	validateDcsSavedGamesPath,
	validateDirectoryPath: async (path: string) => {
		try {
			const stat = await FS.stat(path);
			return stat.isDirectory();
		} catch {
			return false;
		}
	},
	setDownloadsPath: async (path: string) => {
		Domain.Persistance.State.userConfig.data.downloadsPath = path;
		await Domain.Persistance.State.userConfig.save();
	},
	createSupportZip: async () => {
		return await createSupportZip();
	},
};
