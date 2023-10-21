import * as Path from "node:path";

import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { app, BrowserWindow, shell } from "electron";
import FS from "fs-extra";

import * as Events from "../../rpc/events";
import { capture, initCaptureWindow } from "../capture";
import { openCaptureDebugWindow } from "../capture/debug";
import * as Persistance from "../persistance";
import { updateInfo } from "../update";
import { loadApp, mainView, mainWindow } from "../window";

export const actions: Record<Types.AppMenu.Action, () => void> = {
	quit: () => app.quit(),
	minimize: () => BrowserWindow.getFocusedWindow()?.minimize(),
	maximize: () => BrowserWindow.getFocusedWindow()?.maximize(),
	unmaximize: () => BrowserWindow.getFocusedWindow()?.unmaximize(),
	resetZoom: () => mainView.webContents.setZoomLevel(0),
	zoomIn: () => mainView.webContents.setZoomLevel(mainView.webContents.getZoomLevel() + 1),
	zoomOut: () => mainView.webContents.setZoomLevel(mainView.webContents.getZoomLevel() - 1),
	toggleFullscreen: () => {
		mainWindow.setFullScreen(!mainWindow.isFullScreen());
	},
	dev_reload: () => mainView.webContents.reload(),
	dev_forceReload: () => mainView.webContents.reloadIgnoringCache(),
	dev_openDevTools: () => {
		mainView.webContents.openDevTools();
		mainView.webContents.devToolsWebContents?.focus();
	},
	dev_resetUserSettings: async () => {
		try {
			await Persistance.State.userConfig.reset();
			await loadApp("home");
		} catch (err) {
			console.log(`resetUserSettings failed ${Utils.errMsg(err)}`); // eslint-disable-line no-console
		}
	},
	dev_logCampaignState: () => Events.send("menu.dev.logState", undefined),
	dev_captureDebugWindow: () => openCaptureDebugWindow(),
	dev_captureTest: async () => {
		const arr = Array.from({ length: 10 }).map((_v, i) => ({
			type: "campaign.test" as const,
			data: { text: `kneeboard ${i}` },
		}));
		await initCaptureWindow();
		const images = await capture(arr);
		await Promise.all(
			images.map((img, i) => FS.outputFile(Path.join(app.getAppPath(), `../.tmp/capture-test/img-${i}.png`), img)),
		);
	},
	loadLauncher: () => loadApp("home"),
	loadSettings: () => loadApp("home", { action: "settings" }),
	loadAbout: () => loadApp("home", { action: "about" }),
	loadCampaign: () => loadApp("campaign"),
	updateDcc: async () => {
		try {
			if (updateInfo.available && updateInfo.details != undefined) {
				await shell.openExternal(updateInfo.details.url);
			}
		} catch (err) {
			console.log(`updateDcc failed ${Utils.errMsg(err)}`); // eslint-disable-line no-console
		}
	},
	campaign_new: () => Events.send("menu.campaign.new", undefined),
	campaign_open: () => Events.send("menu.campaign.open", undefined),
	campaign_persistance: () => Events.send("menu.campaign.persistance", undefined),
};
