import * as Utils from "@kilcekru/dcc-shared-utils";
import { createMemo, Show } from "solid-js";

const formatTime = (value: number | undefined) => {
	if (value == null) {
		return;
	}

	return value.toString().padStart(2, "0");
};

export const Clock = (props: { value: number | undefined; withDay?: boolean }) => {
	const date = createMemo(() => {
		if (props.value == null) {
			return undefined;
		}

		const d = Utils.timerToDate(props.value);

		return d;
	});

	const day = createMemo(() => date()?.getUTCDate() ?? "-");

	const hours = createMemo(() => {
		const h = date()?.getUTCHours() ?? 0;

		return h;
	});

	return (
		<Show when={date != null}>
			<Show when={props.withDay}>Day {day()} - </Show>
			{formatTime(hours())}:{formatTime(date()?.getMinutes())}:{formatTime(date()?.getSeconds())}
		</Show>
	);
};
