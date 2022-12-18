import * as Path from "node:path";

import { BrowserWindow } from "electron";

import { getAppPath } from "../utils";

export async function startupApp() {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: Path.join(__dirname, "preload.js"),
		},
	});

	await mainWindow.loadFile(getAppPath("launcher"));
}
