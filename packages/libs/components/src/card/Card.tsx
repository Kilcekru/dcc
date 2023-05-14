import { cnb } from "cnbuilder";
import { JSX } from "solid-js";

import { Button } from "../button";
import styles from "./Card.module.less";

export const Card = (props: {
	onPress?: () => void;
	children?: JSX.Element;
	class?: string;
	disabled?: boolean;
	selected?: boolean;
}) => {
	return (
		<Button
			class={cnb(
				styles.card,
				props.class,
				props.disabled ? styles["card--disabled"] : null,
				props.selected ? styles["card--selected"] : null
			)}
			onPress={() => props.onPress?.()}
		>
			{props.children}
		</Button>
	);
};
