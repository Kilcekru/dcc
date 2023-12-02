export const firstItem = <T>(arr: ArrayLike<T> | undefined) => {
	return arr?.[0];
};

export const lastItem = <T>(arr: Array<T>) => {
	return arr[arr.length - 1];
};
