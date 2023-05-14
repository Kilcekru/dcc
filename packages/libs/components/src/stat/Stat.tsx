import { cnb } from "cnbuilder";
import { JSXElement } from "solid-js";

import Styles from "./Stat.module.less";

export const StatLabel = (props: { children?: JSXElement; class?: string }) => {
	return <p class={cnb(Styles["stat-label"], props.class)}>{props.children}</p>;
};

export const StatValue = (props: { children?: JSXElement; class?: string }) => {
	return <p class={cnb(Styles["stat-value"], props.class)}>{props.children}</p>;
};

export const Stat = (props: { children?: JSXElement; class?: string }) => {
	return <div class={cnb(props.class)}>{props.children}</div>;
};
