import { BrowserWindow, Menu } from "electron";

import { loadApp } from "./startup";

const appMenu = Menu.buildFromTemplate([
	{
		label: "File",
		submenu: [
			{
				label: "Settings",
				click: () => {
					void loadApp("launcher", { action: "settings" });
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
				role: "reload",
				accelerator: "F5",
			},
			{
				// second accelerator for reload
				visible: false,
				role: "reload",
				accelerator: "CommandOrControl+R",
			},
			{
				// accelerator for force reload
				visible: false,
				role: "forceReload",
				accelerator: "CommandOrControl+Shift+R",
			},
			{
				label: "Dev Tools",
				role: "toggleDevTools",
				accelerator: "F12",
			},
			{ type: "separator" },
			{
				role: "resetZoom",
				accelerator: "CommandOrControl+num0",
			},
			{
				// second accelerator for reset zoom
				visible: false,
				role: "resetZoom",
				accelerator: "CommandOrControl+0",
			},
			{
				role: "zoomIn",
				accelerator: "CommandOrControl+numadd",
			},
			{
				// second accelerator for zoom in
				visible: false,
				role: "zoomIn",
				accelerator: "CommandOrControl+=",
			},
			{
				role: "zoomOut",
				accelerator: "CommandOrControl+numsub",
			},
			{
				// second accelerator for zoom out
				visible: false,
				role: "zoomOut",
				accelerator: "CommandOrControl+-",
			},
			{ type: "separator" },
			{
				label: "Full Screen",
				role: "togglefullscreen",
				accelerator: "F11",
			},
		],
	},
]);

export function setApplicationMenu() {
	Menu.setApplicationMenu(appMenu);
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
