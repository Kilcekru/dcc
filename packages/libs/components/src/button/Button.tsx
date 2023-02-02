import * as pressable from "@zag-js/pressable";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { cnb } from "cnbuilder";
import { createMemo, createUniqueId, JSX } from "solid-js";

import styles from "./Button.module.less";

export const Button = (props: {
	onPress?: () => void;
	children?: JSX.Element;
	class?: string;
	large?: boolean;
	unstyled?: boolean;
}) => {
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
		<button
			class={cnb(
				styles.button,
				props.large ? styles["button--large"] : null,
				props.unstyled ? styles["button--unstyled"] : null,
				props.class
			)}
			{...api().pressableProps}
		>
			{props.children}
		</button>
	);
};
