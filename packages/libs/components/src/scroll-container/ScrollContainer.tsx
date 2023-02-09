import { cnb } from "cnbuilder";
import { JSXElement } from "solid-js";

import styles from "./ScrollContainer.module.less";

export const ScrollContainer = (props: { children?: JSXElement; class?: string }) => {
	return (
		<div class={cnb(styles["scroll-container__wrapper"], props.class)}>
			<div class={styles["scroll-container"]}>{props.children}</div>
		</div>
	);
};
