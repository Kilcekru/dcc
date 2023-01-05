import * as dialog from "@zag-js/dialog";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { createEffect, createMemo, createUniqueId, JSX, Show } from "solid-js";
import { Portal } from "solid-js/web";

export function Modal(props: { isOpen?: boolean; children?: JSX.Element; onClose?: () => void }) {
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
				<div {...api().backdropProps} />
				<div {...api().containerProps}>
					<div {...api().contentProps}>{props.children}</div>
				</div>
			</Portal>
		</Show>
	);
}
