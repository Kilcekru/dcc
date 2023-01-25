import { cnb } from "cnbuilder";
import { JSX } from "solid-js";

import styles from "./Card.module.less";

export const Card = (props: { onPress?: () => void; children?: JSX.Element; class?: string }) => {
	return <div class={cnb(styles.card, props.class)}>{props.children}</div>;
};
