import { BrowserWindow, Rectangle, screen } from "electron";

import { appState } from "../persistance";

async function saveBounds(win: BrowserWindow) {
	appState.data.win ??= {};
	appState.data.win.bounds = win.getBounds();
	await appState.save();
}

async function saveMaximized(win: BrowserWindow) {
	appState.data.win ??= {};
	appState.data.win.maximized = win.isMaximized() ? true : undefined;
	await appState.save();
}

export function registerBoundsEvents(win: BrowserWindow) {
	win.on("resized", () => saveBounds(win));
	win.on("moved", () => saveBounds(win));
	win.on("maximize", () => saveMaximized(win));
	win.on("unmaximize", () => saveMaximized(win));
}

export function getWindowBounds(): Partial<Rectangle> {
	const saved = appState.data.win?.bounds;
	if (saved == undefined) {
		return {
			width: 1200,
			height: 800,
		};
	}
	const bounds: Partial<Rectangle> = {};
	const display = screen.getDisplayMatching(saved).bounds;
	bounds.width = saved.width <= display.width ? saved.width : display.width;
	bounds.height = saved.height <= display.height ? saved.height : display.height;

	if (saved.x < display.x) {
		bounds.x = display.x;
	} else if (saved.x + bounds.width > display.x + display.width) {
		bounds.x = display.x + display.width - bounds.width;
	} else {
		bounds.x = saved.x;
	}

	if (saved.y < display.y) {
		bounds.y = display.y;
	} else if (saved.y + bounds.height > display.y + display.height) {
		bounds.y = display.y + display.height - bounds.height;
	} else {
		bounds.y = saved.y;
	}

	return bounds;
}
