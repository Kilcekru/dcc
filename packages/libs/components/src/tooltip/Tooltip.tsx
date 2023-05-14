import * as hoverCard from "@zag-js/hover-card";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { cnb } from "cnbuilder";
import { createMemo, createUniqueId, JSXElement, Show } from "solid-js";
import { Portal } from "solid-js/web";

import Styles from "./Tooltip.module.less";

export const Tooltip = (props: {
	children?: JSXElement;
	class?: string;
	text: string | JSXElement;
	disabled?: boolean;
}) => {
	const [state, send] = useMachine(hoverCard.machine({ id: createUniqueId(), openDelay: 0, closeDelay: 100 }));

	const api = createMemo(() => hoverCard.connect(state, send, normalizeProps));

	return (
		<>
			<div class={cnb(props.class)} {...api().triggerProps}>
				{props.children}
			</div>

			<Show when={api().isOpen && !props.disabled}>
				<Portal>
					<div {...api().positionerProps} class={Styles.tooltip__positioner}>
						<div {...api().contentProps} class={Styles.tooltip__content}>
							<div {...api().arrowProps}>
								<div {...api().arrowTipProps} />
							</div>
							{props.text}
						</div>
					</div>
				</Portal>
			</Show>
		</>
	);
};
