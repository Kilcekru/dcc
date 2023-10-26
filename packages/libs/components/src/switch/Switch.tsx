import { normalizeProps, useMachine } from "@zag-js/solid";
import * as zagSwitch from "@zag-js/switch";
import { cnb } from "cnbuilder";
import { createMemo, createUniqueId, JSX } from "solid-js";

import Styles from "./Switch.module.less";

export function Switch(props: {
	children?: JSX.Element;
	disabled?: boolean;
	checked?: boolean;
	onChange?: (value: boolean) => void;
	class?: string;
}) {
	const [state, send] = useMachine(
		zagSwitch.machine({
			id: createUniqueId(),
			// eslint-disable-next-line solid/reactivity
			disabled: props.disabled,
			// eslint-disable-next-line solid/reactivity
			checked: props.checked,
			onCheckedChange({ checked }) {
				props.onChange?.(checked);
			},
		}),
	);

	const api = createMemo(() => zagSwitch.connect(state, send, normalizeProps));

	return (
		<label {...api().rootProps} class={cnb(Styles.root, props.class)}>
			<input {...api().hiddenInputProps} />
			<div {...api().controlProps} class={Styles.control}>
				<div {...api().thumbProps} class={Styles.thumb} />
			</div>
			<span {...api().labelProps} class={Styles.label}>
				{props.children}
			</span>
		</label>
	);
}
