import { cnb } from "cnbuilder";
import { JSXElement } from "solid-js";

import styles from "./List.module.less";

export const List = (props: { children?: JSXElement; class?: string }) => {
	return <ul class={cnb(styles.list, props.class)}>{props.children}</ul>;
};
