import "./Modal.less";

import * as dialog from "@zag-js/dialog";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { createEffect, createMemo, createUniqueId, JSX, Show } from "solid-js";
import { Portal } from "solid-js/web";

import { Close } from "./Close";

export const Modal = (props: {
	isOpen?: boolean;
	children: JSX.Element;
	onClose: () => void;
	disableClose?: boolean;
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
				<div {...api().backdropProps} class="modal__backdrop" />
				<div {...api().containerProps} class="modal__container">
					<div {...api().contentProps} class="modal__content">
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
