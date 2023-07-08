import * as Path from "node:path";

import { BrowserWindow, session } from "electron";

import * as Domain from "../domain";
import { getAppPath } from "../utils";
import { getWindowBounds, registerBoundsEvents } from "./bounds";
import { setApplicationMenu } from "./menu";

export let mainWindow: BrowserWindow | undefined;

export async function startupApp() {
	const dccSession = session.fromPartition("dcc");
	dccSession.setPermissionRequestHandler((webContents, permission, callback) => {
		callback(false);
	});

	await Promise.all([Domain.Persistance.State.dccConfig.load(), Domain.Persistance.State.userConfig.load()]);

	setApplicationMenu();

	mainWindow = new BrowserWindow({
		...getWindowBounds(),
		show: false,
		webPreferences: {
			preload: Path.join(__dirname, "preload.js"),
			session: dccSession,
		},
		minWidth: 1024,
		minHeight: 700,
	});
	mainWindow.webContents.on("will-navigate", (event) => {
		event.preventDefault();
	});
	mainWindow.webContents.setWindowOpenHandler(() => {
		return { action: "deny" };
	});

	if (Domain.Persistance.State.userConfig.data.dcs.available != undefined) {
		await loadApp(Domain.Persistance.State.userConfig.data.currentApp);
	} else {
		await loadApp("home");
	}

	registerBoundsEvents(mainWindow);

	if (Domain.Persistance.State.dccConfig.data.win?.maximized) {
		mainWindow.maximize();
	} else {
		mainWindow.show();
	}
}

export async function loadApp(name: "home" | "campaign", query?: Record<string, string>) {
	await mainWindow?.loadFile(getAppPath(name), { query });
	Domain.Persistance.State.userConfig.data.currentApp = name;
	setApplicationMenu();
	await Domain.Persistance.State.userConfig.save();
}
