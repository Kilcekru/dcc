import { Launcher } from "@kilcekru/dcc-shared-rpc-types";

import { rpc } from "../utils";

export const launcher: Launcher = {
	findDcsPaths: rpc<Launcher["findDcsPaths"]>("launcher", "findDcsPaths"),
	findDcsSavedGamesPath: rpc<Launcher["findDcsSavedGamesPath"]>("launcher", "findDcsSavedGamesPath"),
	setDcsNotAvailable: rpc<Launcher["setDcsNotAvailable"]>("launcher", "setDcsNotAvailable"),
	setDcsPaths: rpc<Launcher["setDcsPaths"]>("launcher", "setDcsPaths"),
	setSetupComplete: rpc<Launcher["setSetupComplete"]>("launcher", "setSetupComplete"),
	showOpenFileDialog: rpc<Launcher["showOpenFileDialog"]>("launcher", "showOpenFileDialog"),
	validateDcsInstallPath: rpc<Launcher["validateDcsInstallPath"]>("launcher", "validateDcsInstallPath"),
	validateDcsSavedGamesPath: rpc<Launcher["validateDcsSavedGamesPath"]>("launcher", "validateDcsSavedGamesPath"),
};
