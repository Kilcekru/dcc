import { cnb } from "cnbuilder";
import { JSX } from "solid-js/jsx-runtime";

import Styles from "./RangeLabel.module.less";

export function RangeLabel(props: { class?: string; children: JSX.Element }) {
	return <label class={cnb([Styles["range-label"], props.class])}>{props.children}</label>;
}
