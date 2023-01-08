import * as Path from "node:path";

import { BrowserWindow } from "electron";

import { dccState, userConfig } from "../persistance";
import { getAppPath } from "../utils";
import { getWindowBounds, registerBoundsEvents } from "./bounds";

export async function startupApp() {
	await Promise.all([dccState.load(), userConfig.load()]);

	const mainWindow = new BrowserWindow({
		...getWindowBounds(),
		show: false,
		webPreferences: {
			preload: Path.join(__dirname, "preload.js"),
		},
	});
	if (dccState.data.win?.maximized) {
		mainWindow.maximize();
	} else {
		mainWindow.show();
	}

	registerBoundsEvents(mainWindow);

	await mainWindow.loadFile(getAppPath("campaign"));
}
