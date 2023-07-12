// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function catchAwait(reason: any) {
	// eslint-disable-next-line no-console
	console.error(reason instanceof Error ? reason.message : "unknown error");
}

export const random = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

export const randomItem = <T>(arr: Array<T>, filterFn?: (value: T) => boolean): T | undefined => {
	const filtered = filterFn == null ? arr : [...arr].filter(filterFn);

	return filtered[random(0, filtered.length - 1)];
};

export const randomList = <T>(arr: Array<T>, length: number): Array<T> => {
	const selected: Array<T> = [];

	Array.from({ length: length }, () => {
		const s = randomItem(arr, (v) => !selected.some((a) => a == v));

		if (s == null) {
			return;
		}

		selected.push(s);
	});

	return selected;
};

export const firstItem = <T>(arr: Array<T> | undefined) => {
	return arr?.[0];
};

export const lastItem = <T>(arr: Array<T>) => {
	return arr[arr.length - 1];
};
