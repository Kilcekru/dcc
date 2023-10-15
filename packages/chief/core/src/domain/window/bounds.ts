import { BrowserWindow, screen } from "electron";

import * as Persistance from "../persistance";

async function saveBounds(win: BrowserWindow) {
	await Persistance.State.dccConfig.update("win", { ...Persistance.State.dccConfig.data.win, bounds: win.getBounds() });
}

async function saveMaximized(win: BrowserWindow) {
	await Persistance.State.dccConfig.update("win", {
		...Persistance.State.dccConfig.data.win,
		maximized: win.isMaximized(),
	});
}

export function registerBoundsEvents(win: BrowserWindow) {
	win.on("resized", () => saveBounds(win));
	win.on("moved", () => saveBounds(win));
	win.on("maximize", () => saveMaximized(win));
	win.on("unmaximize", () => saveMaximized(win));
}

export function getWindowBounds(): WindowBounds {
	const saved = Persistance.State.dccConfig.data.win?.bounds;

	if (saved.x === undefined || saved.y === undefined) {
		return saved;
	}

	const display = screen.getDisplayMatching({
		width: saved.width,
		height: saved.height,
		x: saved.x,
		y: saved.y,
	}).bounds;

	const bounds: WindowBounds = {
		width: saved.width <= display.width ? saved.width : display.width,
		height: saved.height <= display.height ? saved.height : display.height,
	};

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

interface WindowBounds {
	width: number;
	height: number;
	x?: number;
	y?: number;
}
