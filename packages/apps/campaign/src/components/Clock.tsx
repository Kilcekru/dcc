import { createMemo, Show } from "solid-js";

const formatTime = (value: number | undefined) => {
	if (value == null) {
		return;
	}

	if (value >= 10) {
		return value.toString();
	} else {
		return `0${value.toString()}`;
	}
};

export const Clock = (props: { value: number | undefined; withDay?: boolean }) => {
	const date = createMemo(() => {
		if (props.value == null) {
			return undefined;
		}

		const d = new Date(props.value * 1000);
		d.setHours(d.getHours() - 1);

		return d;
	});

	const hours = createMemo(() => {
		const h = date()?.getHours() ?? 0;

		return h;
	});

	return (
		<Show when={date != null}>
			<Show when={props.withDay}>Day {date()?.getDate()} - </Show>
			{formatTime(hours())}:{formatTime(date()?.getMinutes())}:{formatTime(date()?.getSeconds())}
		</Show>
	);
};
