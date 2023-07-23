import * as Path from "node:path";
import { pathToFileURL } from "node:url";

import * as Types from "@kilcekru/dcc-shared-types";
import { app, BrowserWindow, ipcMain, IpcMainEvent, WebFrameMain } from "electron";

export async function waitForReady() {
	await new Promise<void>((resolve) => {
		const fn = (event: IpcMainEvent) => {
			if (!validateSender(event.senderFrame)) {
				return;
			}
			ipcMain.off("Capture.ready", fn);
			resolve();
		};
		ipcMain.on("Capture.ready", fn);
	});
}

export async function waitForRenderComplete() {
	await new Promise<void>((resolve) => {
		const fn = (event: IpcMainEvent) => {
			if (!validateSender(event.senderFrame)) {
				return;
			}
			ipcMain.off("Capture.renderComplete", fn);
			resolve();
		};
		ipcMain.on("Capture.renderComplete", fn);
	});
}

export function requestRender(window: BrowserWindow, doc: Types.Capture.Document) {
	window.webContents.send("Capture.requestRender", JSON.stringify(doc));
}

const menuUrl = pathToFileURL(Path.join(app.getAppPath(), "dist/apps/capture/index.html")).href;
function validateSender(frame: WebFrameMain) {
	return frame.url === menuUrl;
}
