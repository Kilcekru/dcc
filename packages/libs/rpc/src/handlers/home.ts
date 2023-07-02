import * as Types from "@kilcekru/dcc-shared-types";

import { rpc } from "../utils";

export const home: Types.Rpc.Home = {
	findDcsPaths: rpc<Types.Rpc.Home["findDcsPaths"]>("home", "findDcsPaths"),
	findDcsSavedGamesPath: rpc<Types.Rpc.Home["findDcsSavedGamesPath"]>("home", "findDcsSavedGamesPath"),
	setDcsNotAvailable: rpc<Types.Rpc.Home["setDcsNotAvailable"]>("home", "setDcsNotAvailable"),
	setDcsPaths: rpc<Types.Rpc.Home["setDcsPaths"]>("home", "setDcsPaths"),
	setSetupComplete: rpc<Types.Rpc.Home["setSetupComplete"]>("home", "setSetupComplete"),
	showOpenFileDialog: rpc<Types.Rpc.Home["showOpenFileDialog"]>("home", "showOpenFileDialog"),
	validateDcsInstallPath: rpc<Types.Rpc.Home["validateDcsInstallPath"]>("home", "validateDcsInstallPath"),
	validateDcsSavedGamesPath: rpc<Types.Rpc.Home["validateDcsSavedGamesPath"]>("home", "validateDcsSavedGamesPath"),
	validateDirectoryPath: rpc<Types.Rpc.Home["validateDirectoryPath"]>("home", "validateDirectoryPath"),
	setDownloadsPath: rpc<Types.Rpc.Home["setDownloadsPath"]>("home", "setDownloadsPath"),
	createSupportZip: rpc<Types.Rpc.Home["createSupportZip"]>("home", "createSupportZip"),
};
