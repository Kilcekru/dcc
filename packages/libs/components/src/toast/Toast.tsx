import { normalizeProps, useActor } from "@zag-js/solid";
import * as toast from "@zag-js/toast";
import { cnb } from "cnbuilder";
import { createMemo, JSXElement } from "solid-js";

import Styles from "./Toast.module.less";

export const Toast = (props: { children?: JSXElement; actor: toast.Service }) => {
	// eslint-disable-next-line solid/reactivity
	const [state, send] = useActor(props.actor);
	const api = createMemo(() => toast.connect(state, send, normalizeProps));

	return (
		<div {...api().rootProps} class={cnb(Styles.root, api().type === "error" ? Styles["root--error"] : null)}>
			<h3 {...api().titleProps} class={Styles.title}>
				{api().title}
			</h3>
			<p {...api().descriptionProps} class={Styles.description}>
				{api().description}
			</p>
		</div>
	);
};
