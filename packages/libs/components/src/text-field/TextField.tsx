import { cnb } from "cnbuilder";
import { JSX } from "solid-js/jsx-runtime";

import Styles from "./TextField.module.less";

export type TextFieldProps = {
	value: string;
	onChange: (value: string) => void;
	class?: string;
	type?: "number";
	disabled?: boolean;
};

export function TextField(props: TextFieldProps) {
	const onChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
		props.onChange(e.currentTarget.value);
	};

	return (
		<input
			type={props.type}
			value={props.value}
			onChange={onChange}
			class={cnb(Styles.input, props.class)}
			disabled={props.disabled}
			spellcheck={false}
		/>
	);
}
