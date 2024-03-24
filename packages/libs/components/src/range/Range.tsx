import { cnb } from "cnbuilder";
import { children, createMemo } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import Styles from "./Range.module.less";

export function Range(props: {
	steps?: number;
	value: number;
	onChange: (value: number) => void;
	class?: string;
	children: JSX.Element;
}) {
	const resolved = children(() => props.children);
	const onChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
		props.onChange(Number(e.currentTarget.value));
	};

	const childrenCount = createMemo(() => resolved.toArray().length);

	return (
		<div class={cnb([Styles.range, props.class])} style={{ "--slots": childrenCount() }}>
			<input
				class={Styles["range-input"]}
				type="range"
				id="vol"
				name="vol"
				min="0"
				max={props.steps == null ? 4 : props.steps - 1}
				value={props.value}
				onChange={onChange}
			/>
			{props.children}
		</div>
	);
}
