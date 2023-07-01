export function isError(obj: unknown): obj is Error {
	return obj instanceof Error;
}

export function errMsg(obj: unknown, location?: string): string {
	return isError(obj) ? obj.message : `Unknown Error${location ? ` @ ${location}` : ""}`;
}
