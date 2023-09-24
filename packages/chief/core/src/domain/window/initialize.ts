import * as Path from "node:path";

import { app, BrowserView, BrowserWindow, session } from "electron";

import * as Menu from "../menu";
import * as Persistance from "../persistance";
import { getWindowBounds, registerBoundsEvents } from "./bounds";
import { enableLiveReload } from "./liveReload";
import { loadApp, setViewBounds } from "./utils";

export let mainWindow: BrowserWindow;
export let mainView: BrowserView;
export let menuView: BrowserView;

export async function initialize() {
	const dccSession = session.fromPartition("dcc");
	dccSession.setPermissionRequestHandler((webContents, permission, callback) => {
		callback(false);
	});

	// window
	mainWindow = new BrowserWindow({
		...getWindowBounds(),
		show: false,
		webPreferences: { session: dccSession },
		minWidth: 1024,
		minHeight: 700,
		frame: false,
		backgroundColor: "#27212e",
	});

	mainWindow.setMenu(await Menu.initialize());

	// main view
	mainView = new BrowserView({
		webPreferences: { preload: Path.join(app.getAppPath(), "dist/chief/preload/main.js"), session: dccSession },
	});
	enableLiveReload(mainView.webContents);
	mainView.webContents.on("will-navigate", (event) => {
		event.preventDefault();
	});
	mainView.webContents.setWindowOpenHandler(() => {
		return { action: "deny" };
	});
	mainWindow.addBrowserView(mainView);

	// menu view
	menuView = new BrowserView({
		webPreferences: { preload: Path.join(app.getAppPath(), "dist/chief/preload/menu.js"), session: dccSession },
	});
	enableLiveReload(menuView.webContents);
	menuView.webContents.on("will-navigate", (event) => {
		event.preventDefault();
	});
	menuView.webContents.setWindowOpenHandler(() => {
		return { action: "deny" };
	});
	await menuView.webContents.loadFile(Path.join(app.getAppPath(), "dist/chief/menu/index.html"));
	mainWindow.addBrowserView(menuView);

	registerBoundsEvents(mainWindow);
	setViewBounds();
	mainWindow.on("maximize", () => setViewBounds(false));
	mainWindow.on("unmaximize", () => setViewBounds(false));

	if (Persistance.State.userConfig.data.dcs.available != undefined) {
		await loadApp(Persistance.State.userConfig.data.currentApp);
	} else {
		await loadApp("home");
	}

	if (Persistance.State.dccConfig.data.win?.maximized) {
		mainWindow.maximize();
	} else {
		mainWindow.show();
	}
}
