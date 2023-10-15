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

export const multiply = (a: number, b: number): number => {
	return a * b;
};

export const divide = (a: number, b: number): number => {
	return a / b;
};

export const round = (a: number, precision: number): number => {
	const multiplier = Math.pow(10, precision);
	return divide(Math.round(multiply(a, multiplier)), multiplier);
};

export function mapRange(
	value: number,
	originalMin: number,
	originalMax: number,
	newMin: number,
	newMax: number,
): number {
	// Calculate the ratio of the value in the original range
	const originalRange = originalMax - originalMin;
	const ratio = (value - originalMin) / originalRange;

	// Map the ratio to the new range
	const newRange = newMax - newMin;
	const mappedValue = newMin + ratio * newRange;

	return mappedValue;
}
