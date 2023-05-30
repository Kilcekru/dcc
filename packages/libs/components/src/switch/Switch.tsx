import { normalizeProps, useMachine } from "@zag-js/solid";
import * as zagSwitch from "@zag-js/switch";
import { createMemo, createUniqueId, JSX } from "solid-js";

import Styles from "./Switch.module.less";

export function Switch(props: {
	children?: JSX.Element;
	disabled?: boolean;
	checked?: boolean;
	onChange?: (value: boolean) => void;
}) {
	const [state, send] = useMachine(
		zagSwitch.machine({
			id: createUniqueId(),
			disabled: props.disabled,
			checked: props.checked,
			onChange({ checked }) {
				props.onChange?.(checked);
			},
		})
	);

	const api = createMemo(() => zagSwitch.connect(state, send, normalizeProps));

	return (
		<label {...api().rootProps} class={Styles.root}>
			<input {...api().inputProps} />
			<div {...api().controlProps} class={Styles.control}>
				<div {...api().thumbProps} class={Styles.thumb} />
			</div>
			<span {...api().labelProps} class={Styles.label}>
				{props.children}
			</span>
		</label>
	);
}
