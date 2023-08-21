import * as Path from "node:path";

import * as Types from "@kilcekru/dcc-shared-types";
import { app, BrowserWindow, ContextMenuParams, Event, Menu } from "electron";

import { getAppPath } from "../../utils";
import { captureConfig } from "./config";
import * as IPC from "./ipc";

let captureDebugWindow: BrowserWindow | undefined;
let captures: { doc: Types.Capture.Document; time: Date }[] = [];
let currentIndex = 0;

export async function openCaptureDebugWindow() {
	if (captureDebugWindow != undefined) {
		return;
	}

	captureDebugWindow = new BrowserWindow({
		x: 0,
		y: 0,
		resizable: false,
		maximizable: false,
		fullscreenable: false,
		enableLargerThanScreen: true,
		webPreferences: {
			preload: Path.join(app.getAppPath(), "dist/chief/preload/capture.js"),
		},
	});

	captureDebugWindow.webContents.on("will-navigate", (e) => e.preventDefault());
	captureDebugWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

	// remove menu, becaue it would lead to wrong content size
	captureDebugWindow.removeMenu();

	// set size explicitly, otherwise it might be constrained by screen size
	captureDebugWindow.setContentSize(captureConfig.width, captureConfig.height);

	captureDebugWindow.webContents.on("context-menu", onContextMenu);

	captureDebugWindow.once("close", () => {
		captureDebugWindow = undefined;
	});

	await captureDebugWindow.loadFile(getAppPath("capture"));
	IPC.initialize(captureDebugWindow);
	renderDoc();
}

function renderDoc(index?: number) {
	if (index != undefined) {
		currentIndex = index;
	}
	const doc = captures[currentIndex]?.doc;
	if (captureDebugWindow != undefined && doc != undefined) {
		IPC.requestRender(captureDebugWindow, doc);
	}
}

export function debugDocs(docs: Types.Capture.Document[]) {
	for (const doc of docs) {
		captures.push({ doc, time: new Date() });
	}
	if (captures.length > 10) {
		captures = captures.slice(-10);
	}
	if (captures.length > 0) {
		renderDoc(captures.length - 1);
	}
}

function onContextMenu(_e: Event, params: ContextMenuParams) {
	if (captureDebugWindow == undefined) {
		return;
	}

	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Documents",
			type: "submenu",
			submenu: captures
				.map((capture, index) => ({
					label: `${capture.doc.type} - ${capture.time.toISOString()}`,
					click: () => renderDoc(index),
				}))
				.reverse(),
		},
		{
			label: "Reload",
			click: () => {
				captureDebugWindow?.webContents.reload();
				setTimeout(() => {
					if (captureDebugWindow != undefined) {
						IPC.initialize(captureDebugWindow);
						renderDoc();
					}
				}, 100);
			},
		},
		{
			label: "Inspect",
			click: () => {
				captureDebugWindow?.webContents.inspectElement(params.x, params.y);
			},
		},
	]);
	contextMenu.popup({ window: captureDebugWindow, x: params.x, y: params.y });
}
