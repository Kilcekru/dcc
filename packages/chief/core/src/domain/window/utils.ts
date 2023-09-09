import { BrowserWindow, Menu, WebContents } from "electron";

import { getAppPath } from "../../utils";
import * as Persistance from "../persistance";
import { mainView, mainWindow, menuView } from "./initialize";

export async function loadApp(name: "home" | "campaign", query?: Record<string, string>) {
	await mainView.webContents.loadFile(getAppPath(name), { query });
	await Persistance.State.userConfig.update("currentApp", name);
}

interface OpenContextMenuArgs {
	webContent: WebContents;
	x: number;
	y: number;
}
export function openContextMenu(args: OpenContextMenuArgs) {
	const window = BrowserWindow.fromWebContents(args.webContent);
	if (window == undefined) {
		return;
	}
	const view = window.getBrowserViews().find((v) => v.webContents === args.webContent);
	if (view == undefined) {
		return;
	}
	const viewBounds = view.getBounds();

	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Inspect",
			click: () => {
				args.webContent.inspectElement(args.x, args.y);
			},
		},
	]);
	contextMenu.popup({
		window: window,
		x: args.x + viewBounds.x,
		y: args.y + viewBounds.y,
	});
}

let menuExpanded = false;
export function setViewBounds(expandMenu?: boolean) {
	// view bounds are buggy in electron, they will not correctly fit the window
	// calc correct viewBounds from windowBounds
	const bounds = mainWindow.getBounds();
	const maxed = mainWindow.isMaximized();
	if (expandMenu != undefined) {
		menuExpanded = expandMenu;
	}
	menuView.setBounds({
		x: 0,
		y: 0,
		width: bounds.width - (maxed ? 16 : 0),
		height: menuExpanded ? bounds.height - (maxed ? 16 : 0) : 30,
	});
	menuView.setAutoResize({ width: true, height: menuExpanded });
	mainView.setBounds({
		x: 0,
		y: 30,
		width: bounds.width - (maxed ? 16 : 0),
		height: bounds.height - (maxed ? 46 : 30),
	});
	mainView.setAutoResize({ width: true, height: true });
}
