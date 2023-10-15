import { cnb } from "cnbuilder";
import { JSX } from "solid-js";

import Styles from "./Button.module.less";

export const Button = (props: {
	onPress?: () => void;
	children?: JSX.Element;
	class?: string;
	large?: boolean;
	disabled?: boolean;
	tooltipDisabled?: boolean;
	unstyled?: boolean;
	tooltipLabel?: string;
}) => {
	const onClick = (e: MouseEvent) => {
		if (props.onPress != undefined) {
			e.stopPropagation();
			e.preventDefault();

			props.onPress();
		}
	};

	return (
		<>
			<button
				class={cnb(
					Styles.button,
					props.large ? Styles["button--large"] : null,
					props.unstyled ? Styles["button--unstyled"] : null,
					props.disabled ? Styles["button--disabled"] : null,
					props.class,
				)}
				onClick={onClick}
			>
				{props.children}
			</button>
		</>
	);
};
