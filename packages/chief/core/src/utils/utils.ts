import * as Path from "node:path";

export function getAppPath(name: string) {
	return Path.join(__dirname, "../apps", name, "index.html");
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
