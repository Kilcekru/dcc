import { app } from "electron";
import squirrelStartupCheck from "electron-squirrel-startup";

import * as Domain from "./domain";
import { startRpc } from "./rpc";

declare const BUILD_ENV: boolean;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartupCheck) {
	app.quit();
}

const instanceLock = app.requestSingleInstanceLock();
if (!instanceLock) {
	app.quit();
} else {
	app.on("second-instance", () => {
		app.focus();
	});

	if (BUILD_ENV) {
		// Domain.Window.enableLiveReload(); // todo
	}

	app.on("window-all-closed", () => {
		app.quit();
	});

	app.on("ready", async () => {
		await Promise.all([Domain.Persistance.State.dccConfig.load(), Domain.Persistance.State.userConfig.load()]);
		await Domain.Window.initialize();
	});
	startRpc();
}
