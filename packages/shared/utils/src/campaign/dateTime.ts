export function timerToDate(value: number) {
	const d = new Date(value);

	return d;
}

export const Minutes = (value: number) => {
	return value * 60 * 1000;
};

export const Hours = (value: number) => {
	return Minutes(value) * 60;
};

export const toFullMinutes = (value: number) => {
	return Math.round(value / 1000 / 60) * 1000 * 60;
};
