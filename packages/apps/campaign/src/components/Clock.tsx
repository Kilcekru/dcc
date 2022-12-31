import { Show } from "solid-js";

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

export const Clock = (props: { value: number | undefined }) => {
	const date = () => (props.value == null ? undefined : new Date(props.value * 1000));

	return (
		<Show when={date != null}>
			{formatTime((date()?.getHours() ?? 0) - 1)}:{formatTime(date()?.getMinutes())}:{formatTime(date()?.getSeconds())}
		</Show>
	);
};
