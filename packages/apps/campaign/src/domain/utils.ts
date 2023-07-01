// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function catchAwait(reason: any) {
	// eslint-disable-next-line no-console
	console.error(reason instanceof Error ? reason.message : "unknown error");
}
