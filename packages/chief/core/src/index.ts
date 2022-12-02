import * as Path from "node:path";

import { app, BrowserWindow } from "electron";
import squirrelStartupCheck from "electron-squirrel-startup";

import { getAppPath } from "./utils";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartupCheck) {
	app.quit();
}

const createWindow = async () => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: Path.join(__dirname, "preload.js"),
		},
	});

	await mainWindow.loadFile(getAppPath("launcher"));
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", async () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		await createWindow();
	}
});
