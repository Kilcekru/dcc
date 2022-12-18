import * as Path from "node:path";

import { BrowserWindow } from "electron";

import { appState } from "../persistance";
import { getAppPath } from "../utils";
import { getWindowBounds, registerBoundsEvents } from "./bounds";

export async function startupApp() {
	await appState.load();

	const mainWindow = new BrowserWindow({
		...getWindowBounds(),
		show: false,
		webPreferences: {
			preload: Path.join(__dirname, "preload.js"),
		},
	});
	if (appState.data.win?.maximized) {
		mainWindow.maximize();
	} else {
		mainWindow.show();
	}

	registerBoundsEvents(mainWindow);

	await mainWindow.loadFile(getAppPath("launcher"));
}
