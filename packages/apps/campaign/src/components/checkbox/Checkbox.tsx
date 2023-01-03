import "./Checkbox.less";

import * as checkbox from "@zag-js/checkbox";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { createMemo, createUniqueId, JSX } from "solid-js";

export const Checkbox = (props: { children: JSX.Element }) => {
	const [state, send] = useMachine(checkbox.machine({ id: createUniqueId() }));

	const api = createMemo(() => checkbox.connect(state, send, normalizeProps));

	return (
		<label {...api().rootProps} class="checkbox">
			<div {...api().controlProps} class="checkbox__control" />
			<span {...api().labelProps}>{props.children}</span>
			<input {...api().inputProps} />
		</label>
	);
};
