import { Launcher } from "@kilcekru/dcc-shared-rpc-types";

import { rpc } from "../utils";

export const launcher: Launcher = {
	findDcsPaths: rpc<Launcher["findDcsPaths"]>("launcher", "findDcsPaths"),
	findDcsSavedGamesPath: rpc<Launcher["findDcsSavedGamesPath"]>("launcher", "findDcsSavedGamesPath"),
	validateDcsInstallPath: rpc<Launcher["validateDcsInstallPath"]>("launcher", "validateDcsInstallPath"),
	validateDcsSavedGamesPath: rpc<Launcher["validateDcsSavedGamesPath"]>("launcher", "validateDcsSavedGamesPath"),
	setDcsNotAvailable: rpc<Launcher["setDcsNotAvailable"]>("launcher", "setDcsNotAvailable"),
	setDcsPaths: rpc<Launcher["setDcsPaths"]>("launcher", "setDcsPaths"),
};
