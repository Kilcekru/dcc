import * as Path from "node:path";
import { pathToFileURL } from "node:url";

import * as Types from "@kilcekru/dcc-shared-types";
import { app, ipcMain, WebFrameMain } from "electron";

import { config } from "../../config";
import * as Window from "../window";
import { actions } from "./actions";
import { getConfig } from "./config";

export function setupIpc() {
	ipcMain.handle("Menu.getConfig", async (event) => {
		if (!validateSender(event.senderFrame)) {
			return;
		}
		return JSON.stringify(await getConfig());
	});

	ipcMain.handle("Menu.handleAction", (event, args: string) => {
		if (!validateSender(event.senderFrame)) {
			return;
		}
		const { action } = JSON.parse(args) as { action: Types.AppMenu.Action };
		actions[action]();
	});

	ipcMain.handle("Menu.expand", (event) => {
		if (!validateSender(event.senderFrame)) {
			return;
		}
		Window.setViewBounds(true);
	});
	ipcMain.handle("Menu.collapse", (event) => {
		if (!validateSender(event.senderFrame)) {
			return;
		}
		Window.setViewBounds(false);
	});

	ipcMain.handle("Menu.contextMenu", async (event, args: string) => {
		if (!validateSender(event.senderFrame) || config.env !== "dev") {
			return;
		}
		const { x, y } = JSON.parse(args) as { x: number; y: number };
		Window.openContextMenu({
			webContent: event.sender,
			x,
			y,
		});
	});
}

export const onConfigChanged = async () => {
	Window.menuView.webContents.send("Menu.onConfigChanged", JSON.stringify(await getConfig()));
};

const menuUrl = pathToFileURL(Path.join(app.getAppPath(), "dist/chief/menu/index.html")).href;
function validateSender(frame: WebFrameMain) {
	return frame.url === menuUrl;
}
