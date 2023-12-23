export function isSerialized(value: unknown): value is { serialized: true } {
	return typeof value === "object" && value != null && "serialized" in value && value.serialized === true;
}
