import { JSXElement } from "solid-js";

export const List = (props: { children?: JSXElement }) => {
	return <ul class="list">{props.children}</ul>;
};
