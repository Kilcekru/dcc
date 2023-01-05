import "./Button.less";

import * as pressable from "@zag-js/pressable";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { createMemo, createUniqueId, JSX } from "solid-js";

import { optionalClass } from "../../utils";

export const Button = (props: { onPress?: () => void; children?: JSX.Element; class?: string }) => {
	const [state, send] = useMachine(
		pressable.machine({
			id: createUniqueId(),
			onPress() {
				props.onPress?.();
			},
		})
	);

	const api = createMemo(() => pressable.connect(state, send, normalizeProps));

	return (
		<button class={optionalClass("button", props.class)} {...api().pressableProps}>
			{props.children}
		</button>
	);
};
