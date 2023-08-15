import * as Types from "@kilcekru/dcc-shared-types";
import { BrowserWindow } from "electron";

export function initialize(window: BrowserWindow) {
	window.webContents.send("Capture.initialize");
}

export function requestRender(window: BrowserWindow, doc: Types.Capture.Document) {
	window.webContents.send("Capture.requestRender", JSON.stringify(doc));
}
