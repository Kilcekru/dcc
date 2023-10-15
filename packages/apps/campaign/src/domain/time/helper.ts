export const Minutes = (value: number) => {
	return value * 60;
};

export const Hours = (value: number) => {
	return Minutes(value) * 60;
};
