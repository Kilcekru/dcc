import * as dialog from "@zag-js/dialog";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { createEffect, createMemo, createUniqueId, Show } from "solid-js";
import { Portal } from "solid-js/web";

export default function Modal(props: { isOpen?: boolean }) {
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
					<div {...api().contentProps}>
						<h2 {...api().titleProps}>Edit profile</h2>
						<p {...api().descriptionProps}>Make changes to your profile here. Click save when you are done.</p>
						<button {...api().closeTriggerProps}>X</button>
						<input placeholder="Enter name..." />
						<button>Save Changes</button>
					</div>
				</div>
			</Portal>
		</Show>
	);
}
