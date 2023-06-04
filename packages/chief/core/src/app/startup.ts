import * as Path from "node:path";

import { BrowserWindow, shell } from "electron";

import { dccState, userConfig } from "../persistance";
import { getAppPath } from "../utils";
import { getWindowBounds, registerBoundsEvents } from "./bounds";
import { setApplicationMenu } from "./menu";

export let mainWindow: BrowserWindow | undefined;

export async function startupApp() {
	await Promise.all([dccState.load(), userConfig.load()]);

	if (!(["home", "campaign"] as Array<string | undefined>).includes(userConfig.data.currentApp)) {
		userConfig.data.currentApp = "home";
	}
	setApplicationMenu();

	mainWindow = new BrowserWindow({
		...getWindowBounds(),
		show: false,
		webPreferences: {
			preload: Path.join(__dirname, "preload.js"),
		},
	});
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		void shell.openExternal(url);
		return { action: "deny" };
	});

	if (userConfig.data.dcs != undefined && userConfig.data.currentApp != undefined) {
		await loadApp(userConfig.data.currentApp);
	} else {
		await loadApp("home");
	}

	registerBoundsEvents(mainWindow);

	if (dccState.data.win?.maximized) {
		mainWindow.maximize();
	} else {
		mainWindow.show();
	}
}

export async function loadApp(name: "home" | "campaign", query?: Record<string, string>) {
	await mainWindow?.loadFile(getAppPath(name), { query });
	userConfig.data.currentApp = name;
	setApplicationMenu();
	await userConfig.save();
}
