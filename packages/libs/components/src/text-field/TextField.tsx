import { cnb } from "cnbuilder";
import { JSX } from "solid-js/jsx-runtime";

import Styles from "./TextField.module.less";

export function TextField(props: {
	value: string;
	onChange: (value: string) => void;
	class?: string;
	disabled?: boolean;
}) {
	const onChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
		props.onChange(e.currentTarget.value);
	};

	return (
		<input value={props.value} onChange={onChange} class={cnb(Styles.input, props.class)} disabled={props.disabled} />
	);
}
