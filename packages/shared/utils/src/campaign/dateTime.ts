export function timerToDate(value: number) {
	const d = new Date(value * 1000);

	return d;
}
