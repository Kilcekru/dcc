const dateFormatter = new Intl.DateTimeFormat();
const dateTimeFormatter = new Intl.DateTimeFormat("de-AT", {
	year: "2-digit",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
});
const timeFormatter = new Intl.DateTimeFormat("de-AT", {
	hour: "2-digit",
	minute: "2-digit",
});

export function formatDate(date: string | Date | undefined) {
	if (date == null) {
		return;
	}

	return dateFormatter.format(new Date(date));
}

export function formatDateTime(date: string | Date | undefined) {
	if (date == null) {
		return;
	}

	return dateTimeFormatter.format(new Date(date));
}

export function formatTime(date: number | Date | undefined) {
	if (date == null) {
		return;
	}

	return timeFormatter.format(new Date(date));
}
