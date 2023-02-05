import { cnb } from "cnbuilder";
import { JSX } from "solid-js";

import { Button } from "../button";
import styles from "./Card.module.less";

export const Card = (props: { onPress?: () => void; children?: JSX.Element; class?: string }) => {
	return (
		<Button class={cnb(styles.card, props.class)} onPress={() => props.onPress?.()}>
			{props.children}
		</Button>
	);
};
