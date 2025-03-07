import "./Checkbox.less";

import * as checkbox from "@zag-js/checkbox";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { createMemo, createUniqueId, JSX } from "solid-js";

export const Checkbox = (props: { children: JSX.Element; onChange: (value: boolean) => void }) => {
	const service = useMachine(checkbox.machine, { id: createUniqueId() });

	const api = createMemo(() => checkbox.connect(service, normalizeProps));

	return (
		<label {...api().getRootProps()} class="checkbox">
			<div {...api().getControlProps()} class="checkbox__control" />
			<span {...api().getLabelProps()}>{props.children}</span>
			<input type="checkbox" onChange={(e) => props.onChange(e.currentTarget.checked)} />
		</label>
	);
};
