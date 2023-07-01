export function isRecord(value: unknown): value is Record<string, unknown> {
	return (
		typeof value === "object" &&
		value != null &&
		Object.prototype.toString.call(value) === "[object Object]" &&
		(Object.getPrototypeOf(value) === null || Object.getPrototypeOf(Object.getPrototypeOf(value)) === null)
	);
}

export function isArray(value: unknown, type?: undefined): value is Array<unknown>;
export function isArray(value: unknown, type: "string"): value is Array<string>;
export function isArray(value: unknown, type: "number"): value is Array<number>;
export function isArray(value: unknown, type?: "string" | "number"): value is Array<unknown> {
	if (!Array.isArray(value)) {
		return false;
	}
	switch (type) {
		case undefined:
			return true;
		case "number":
			return value.every((entry) => typeof entry === "number");
		case "string":
			return value.every((entry) => typeof entry === "string");
	}
	return false;
}

function _hasKey<Key extends string>(value: unknown, key: Key): value is { [k in Key]: unknown } {
	return typeof value === "object" && value != null && key in value;
}

export function hasKey<Key extends string>(
	value: unknown,
	key: Key,
	type?: undefined
): value is { [k in Key]: unknown };
export function hasKey<Key extends string>(value: unknown, key: Key, type: "boolean"): value is { [k in Key]: boolean };
export function hasKey<Key extends string>(value: unknown, key: Key, type: "number"): value is { [k in Key]: number };
export function hasKey<Key extends string>(value: unknown, key: Key, type: "string"): value is { [k in Key]: string };
export function hasKey<Key extends string>(value: unknown, key: Key, type: "Date"): value is { [k in Key]: Date };
export function hasKey<Key extends string>(
	value: unknown,
	key: Key,
	type: "array"
): value is { [k in Key]: Array<unknown> };
export function hasKey<Key extends string>(
	value: unknown,
	key: Key,
	type?: "boolean" | "number" | "string" | "Date" | "array"
): value is { [k in Key]: unknown } {
	if (!_hasKey(value, key)) {
		return false;
	}
	switch (type) {
		case undefined:
			return true;
		case "boolean":
			return typeof value[key] === "boolean";
		case "number":
			return typeof value[key] === "number";
		case "string":
			return typeof value[key] === "string";
		case "Date":
			return value[key] instanceof Date;
	}
	return false;
}
