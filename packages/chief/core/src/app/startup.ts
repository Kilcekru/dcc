import * as Path from "node:path";

import { BrowserWindow } from "electron";

import { dccState, userConfig } from "../persistance";
import { getAppPath } from "../utils";
import { getWindowBounds, registerBoundsEvents } from "./bounds";
import { setApplicationMenu } from "./menu";

export let mainWindow: BrowserWindow | undefined;

export async function startupApp() {
	await Promise.all([dccState.load(), userConfig.load()]);

	setApplicationMenu(userConfig.data.currentApp ?? "launcher");

	mainWindow = new BrowserWindow({
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

	if (userConfig.data.setupComplete && userConfig.data.dcs != undefined && userConfig.data.currentApp != undefined) {
		await mainWindow.loadFile(getAppPath(userConfig.data.currentApp));
	} else {
		await mainWindow.loadFile(getAppPath("launcher"));
	}
}

export async function loadApp(name: "launcher" | "campaign", query?: Record<string, string>) {
	await mainWindow?.loadFile(getAppPath(name), { query });
	setApplicationMenu(name);
	userConfig.data.currentApp = name;
	await userConfig.save();
}
