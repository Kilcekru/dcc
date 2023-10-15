import * as Path from "node:path";

import { app } from "electron";

export function getAppPath(name: "home" | "campaign" | "capture") {
	return Path.join(app.getAppPath(), "dist/apps", name, "index.html");
}

function isObject(data: unknown) {
	return Object.prototype.toString.call(data) === "[object Object]";
}

export function isPlainObject(data: unknown): data is Record<string, unknown> {
	if (data == undefined || !isObject(data)) {
		return false;
	}
	if (data.constructor === undefined) {
		return true;
	}
	if (!isObject(data.constructor.prototype)) {
		return false;
	}
	return true;
}

export function isArray(data: unknown): data is unknown[] {
	return Array.isArray(data);
}
