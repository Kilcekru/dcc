import * as Path from "node:path";

import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { app, BrowserWindow } from "electron";
import FS from "fs-extra";

import * as Events from "../../rpc/events";
import { capture, showCaptureWindow } from "../capture";
import * as Persistance from "../persistance";
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
	dev_captureWindow: () => showCaptureWindow(),
	dev_captureTest: async () => {
		const images = await capture([
			{ type: "campaign.briefing", data: { text: "kneeboard 1" } },
			{ type: "campaign.briefing", data: { text: "kneeboard 2" } },
			{ type: "campaign.briefing", data: { text: "kneeboard 3" } },
		]);
		await Promise.all(images.map((img, i) => FS.outputFile(Path.join(app.getAppPath(), `../.tmp/img-${i}.png`), img)));
	},
	loadLauncher: () => loadApp("home"),
	loadSettings: () => loadApp("home", { action: "settings" }),
	loadAbout: () => loadApp("home", { action: "about" }),
	loadCampaign: () => loadApp("campaign"),
	campaign_new: () => Events.send("menu.campaign.new", undefined),
	campaign_open: () => Events.send("menu.campaign.open", undefined),
};
