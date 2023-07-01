import { BrowserWindow, Rectangle, screen } from "electron";

import * as Domain from "../domain";

async function saveBounds(win: BrowserWindow) {
	Domain.Persistance.State.dccConfig.data.win.bounds = win.getBounds();
	await Domain.Persistance.State.dccConfig.save();
}

async function saveMaximized(win: BrowserWindow) {
	Domain.Persistance.State.dccConfig.data.win.maximized = win.isMaximized();
	await Domain.Persistance.State.dccConfig.save();
}

export function registerBoundsEvents(win: BrowserWindow) {
	win.on("resized", () => saveBounds(win));
	win.on("moved", () => saveBounds(win));
	win.on("maximize", () => saveMaximized(win));
	win.on("unmaximize", () => saveMaximized(win));
}

export function getWindowBounds(): Partial<Rectangle> {
	const saved = Domain.Persistance.State.dccConfig.data.win?.bounds;

	if (saved.x === undefined || saved.y === undefined) {
		return saved;
	}

	const display = screen.getDisplayMatching({
		width: saved.width,
		height: saved.height,
		x: saved.x,
		y: saved.y,
	}).bounds;
	const bounds: Partial<Rectangle> = {};
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
