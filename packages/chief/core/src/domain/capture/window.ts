import * as Path from "node:path";

import { app, BrowserWindow, ContextMenuParams, Event, Menu } from "electron";

import { getAppPath } from "../../utils";
import { config } from "./config";
import * as IPC from "./ipc";

let captureWindow: BrowserWindow | undefined;
let visible = false;

export async function getCaptureWindow() {
	if (captureWindow != undefined) {
		return captureWindow;
	}

	captureWindow = new BrowserWindow({
		x: 0,
		y: 0,
		show: false,
		resizable: false,
		maximizable: false,
		fullscreenable: false,
		enableLargerThanScreen: true,
		webPreferences: {
			preload: Path.join(app.getAppPath(), "dist/chief/preload/capture.js"),
		},
	});

	captureWindow.webContents.on("will-navigate", (e) => e.preventDefault());
	captureWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

	// remove menu, becaue it would lead to wrong content size
	captureWindow.removeMenu();

	// set size explicitly, otherwise it might be constrained by screen size
	captureWindow.setContentSize(config.width, config.height);

	captureWindow.webContents.on("context-menu", onContextMenu);

	captureWindow.once("close", () => {
		captureWindow = undefined;
		visible = false;
	});

	const ready = IPC.waitForReady();
	await captureWindow.loadFile(getAppPath("capture"));
	await ready;
	return captureWindow;
}

export function isCaptureWindowVisible() {
	return visible;
}

export async function showCaptureWindow() {
	const window = await getCaptureWindow();
	window.show();
	visible = true;
}

function onContextMenu(_e: Event, params: ContextMenuParams) {
	if (captureWindow == undefined) {
		return;
	}

	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Reload",
			click: () => {
				captureWindow?.webContents.reload();
			},
		},
		{ type: "separator" },
		{
			label: "Inspect",
			click: () => {
				captureWindow?.webContents.inspectElement(params.x, params.y);
			},
		},
	]);
	contextMenu.popup({ window: captureWindow, x: params.x, y: params.y });
}
