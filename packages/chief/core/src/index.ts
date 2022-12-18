import { app } from "electron";
import squirrelStartupCheck from "electron-squirrel-startup";

import { enableLiveReload } from "./app/liveReload";
import { startupApp } from "./app/startup";
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
		enableLiveReload();
	}

	app.on("ready", startupApp);

	app.on("window-all-closed", () => {
		app.quit();
	});

	startRpc();
}
