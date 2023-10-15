import * as Path from "node:path";

import { app, BrowserWindow } from "electron";

import { getAppPath } from "../../utils";
import { captureConfig } from "./config";
import * as IPC from "./ipc";

let captureWindow: BrowserWindow | undefined;

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
			offscreen: true,
		},
	});

	captureWindow.webContents.on("will-navigate", (e) => e.preventDefault());
	captureWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

	// remove menu, becaue it would lead to wrong content size
	captureWindow.removeMenu();

	// set size explicitly, otherwise it might be constrained by screen size
	captureWindow.setContentSize(captureConfig.width, captureConfig.height);

	captureWindow.once("close", () => {
		captureWindow = undefined;
	});

	let painted = new Promise((r) => captureWindow?.webContents.once("paint", r));
	await captureWindow.loadFile(getAppPath("capture"));
	await painted;
	painted = new Promise((r) => captureWindow?.webContents.once("paint", r));
	IPC.initialize(captureWindow);
	await painted;
	return captureWindow;
}

export async function initCaptureWindow() {
	await getCaptureWindow();
}

export function closeCaptureWindow() {
	if (captureWindow != undefined) {
		captureWindow.close();
	}
}
