import "./Modal.less";

import * as dialog from "@zag-js/dialog";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { cnb } from "cnbuilder";
import { createEffect, createMemo, createUniqueId, JSX, Show } from "solid-js";
import { Portal } from "solid-js/web";

import { Close } from "./Close";

export const Modal = (props: {
	isOpen?: boolean;
	children: JSX.Element;
	onClose: () => void;
	disableClose?: boolean;
	class?: string;
}) => {
	const [state, send] = useMachine(dialog.machine({ id: createUniqueId() }));

	const api = createMemo(() => dialog.connect(state, send, normalizeProps));

	createEffect(() => {
		if (props.isOpen) {
			api().open();
		} else {
			api().close();
		}
	});

	return (
		<Show when={api().isOpen}>
			<Portal>
				<div {...api().backdropProps} class={cnb("modal__backdrop", props.class)} />
				<div {...api().containerProps} class={cnb("modal__container", props.class)}>
					<div {...api().contentProps} class={cnb("modal__content", props.class)}>
						{props.children}
						<Show when={props.disableClose !== true}>
							<Close
								onPress={() => {
									props.onClose();
								}}
							/>
						</Show>
					</div>
				</div>
			</Portal>
		</Show>
	);
};
