import { cnb } from "cnbuilder";
import { JSXElement } from "solid-js";

export const Tooltip = (props: {
	children?: JSXElement;
	class?: string;
	text: string | JSXElement;
	disabled?: boolean;
}) => {
	return (
		<>
			<div class={cnb(props.class)}>{props.children}</div>
		</>
	);
};
