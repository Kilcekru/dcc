import { cnb } from "cnbuilder";
import { JSX } from "solid-js";

import styles from "./Button.module.less";

export const Button = (props: {
	onPress?: () => void;
	children?: JSX.Element;
	class?: string;
	large?: boolean;
	unstyled?: boolean;
}) => {
	const onClick = (e: MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();

		props.onPress?.();
	};

	return (
		<button
			class={cnb(
				styles.button,
				props.large ? styles["button--large"] : null,
				props.unstyled ? styles["button--unstyled"] : null,
				props.class
			)}
			onClick={onClick}
		>
			{props.children}
		</button>
	);
};
