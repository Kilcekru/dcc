import * as Types from "@kilcekru/dcc-shared-types";
import { dialog } from "electron";
import FS from "fs-extra";

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
		await Domain.Persistance.State.userConfig.update("setupComplete", true);
	}
}

const showOpenFileDialog: Types.Rpc.Home["showOpenFileDialog"] = async (args) => {
	if (Domain.Window.mainWindow != undefined) {
		const res = await dialog.showOpenDialog(Domain.Window.mainWindow, {
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

export const home: Types.Rpc.Home = {
	findDcsPaths,
	findDcsSavedGamesPath,
	setDcsPaths: async (paths) => {
		await Domain.Persistance.State.userConfig.update("dcs", {
			available: true,
			paths,
		});
		await Domain.Patches.autoPatch();
	},
	setDcsNotAvailable: async () => {
		await Domain.Persistance.State.userConfig.update("dcs", {
			available: false,
		});
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
		await Domain.Persistance.State.userConfig.update("downloadsPath", path);
	},
	createSupportZip: async () => {
		return await createSupportZip();
	},
};
