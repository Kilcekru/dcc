import { Home } from "@kilcekru/dcc-shared-rpc-types";

import { rpc } from "../utils";

export const home: Home = {
	findDcsPaths: rpc<Home["findDcsPaths"]>("home", "findDcsPaths"),
	findDcsSavedGamesPath: rpc<Home["findDcsSavedGamesPath"]>("home", "findDcsSavedGamesPath"),
	setDcsNotAvailable: rpc<Home["setDcsNotAvailable"]>("home", "setDcsNotAvailable"),
	setDcsPaths: rpc<Home["setDcsPaths"]>("home", "setDcsPaths"),
	setSetupComplete: rpc<Home["setSetupComplete"]>("home", "setSetupComplete"),
	showOpenFileDialog: rpc<Home["showOpenFileDialog"]>("home", "showOpenFileDialog"),
	validateDcsInstallPath: rpc<Home["validateDcsInstallPath"]>("home", "validateDcsInstallPath"),
	validateDcsSavedGamesPath: rpc<Home["validateDcsSavedGamesPath"]>("home", "validateDcsSavedGamesPath"),
	validateDirectoryPath: rpc<Home["validateDirectoryPath"]>("home", "validateDirectoryPath"),
	setDownloadsPath: rpc<Home["setDownloadsPath"]>("home", "setDownloadsPath"),
	createSupportZip: rpc<Home["createSupportZip"]>("home", "createSupportZip"),
};
