import { BrowserWindow, Menu, MenuItemConstructorOptions } from "electron";

import { config } from "../config";
import { userConfig } from "../persistance";
import * as Events from "../rpc/events";
import { loadApp } from "./startup";

function getAppMenuTemplate(): MenuItemConstructorOptions[] {
	const currentApp = userConfig.data.currentApp ?? "home";
	const enableNavigation = userConfig.data.setupComplete && userConfig.data.dcs != undefined ? true : false;

	const template: MenuItemConstructorOptions[] = [
		{
			label: "DCC",
			submenu: [
				{
					label: "Launcher",
					enabled: enableNavigation,
					click: () => {
						void loadApp("home");
					},
				},
				{
					label: "Settings",
					enabled: enableNavigation,
					click: () => {
						void loadApp("home", { action: "settings" });
					},
				},
				{ type: "separator" },
				{
					label: "About",
					enabled: enableNavigation,
					click: () => {
						void loadApp("home", { action: "about" });
					},
				},
				{ type: "separator" },
				{ role: "quit" },
			],
		},
		{
			label: "Apps",
			submenu: [
				{
					label: "Campaign",
					enabled: enableNavigation,
					click: () => {
						void loadApp("campaign");
					},
				},
			],
		},
		{
			label: "View",
			submenu: [
				{
					role: "resetZoom",
					accelerator: "CommandOrControl+num0",
				},
				{
					// second accelerator for reset zoom
					role: "resetZoom",
					accelerator: "CommandOrControl+0",
					visible: false,
				},
				{
					role: "zoomIn",
					accelerator: "CommandOrControl+numadd",
				},
				{
					// second accelerator for zoom in
					role: "zoomIn",
					accelerator: "CommandOrControl+=",
					visible: false,
				},
				{
					role: "zoomOut",
					accelerator: "CommandOrControl+numsub",
				},
				{
					// second accelerator for zoom out
					role: "zoomOut",
					accelerator: "CommandOrControl+-",
					visible: false,
				},
				{ type: "separator" },
				{
					label: "Full Screen",
					role: "togglefullscreen",
					accelerator: "F11",
				},
			],
		},
	];

	if (config.env === "dev") {
		template.push({
			label: "Dev",
			submenu: [
				{
					role: "reload",
					accelerator: "F5",
				},
				{
					// second accelerator for reload
					role: "reload",
					accelerator: "CommandOrControl+R",
					visible: false,
				},
				{
					role: "forceReload",
					accelerator: "CommandOrControl+Shift+R",
				},
				{ type: "separator" },
				{
					label: "Dev Tools",
					role: "toggleDevTools",
					accelerator: "F12",
				},
				{
					label: "Reset user settings",
					click: async () => {
						userConfig.reset();
						await userConfig.save();
						void loadApp("home");
					},
				},
				{ type: "separator" },
				{
					label: "Log State",
					click: () => {
						Events.send("menu.dev.logState", undefined);
					},
				},
			],
		});
	}

	if (currentApp === "campaign") {
		template.push({
			label: "Campaign",
			submenu: [
				{
					label: "Reset Campaign",
					click: () => {
						Events.send("menu.campaign.reset", undefined);
					},
				},
				{
					label: "New Campaign",
					click: () => {
						Events.send("menu.campaign.new", undefined);
					},
				},
			],
		});
	}

	return template;
}

export function setApplicationMenu() {
	const template = getAppMenuTemplate();
	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

interface OpenContextMenuArgs {
	window: BrowserWindow;
	x: number;
	y: number;
}
export function openContextMenu(args: OpenContextMenuArgs) {
	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Inspect",
			click: () => {
				args.window.webContents.inspectElement(args.x, args.y);
			},
		},
	]);
	contextMenu.popup({
		window: args.window,
		x: args.x,
		y: args.y,
	});
}
