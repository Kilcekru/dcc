// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function catchAwait(reason: any) {
	// eslint-disable-next-line no-console
	console.error(reason instanceof Error ? reason.message : "unknown error");
}

export const firstItem = <T>(arr: Array<T> | undefined) => {
	return arr?.[0];
};

export const lastItem = <T>(arr: Array<T>) => {
	return arr[arr.length - 1];
};

export const random = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};
