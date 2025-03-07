import "./Modal.less";

import * as dialog from "@zag-js/dialog";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { createEffect, JSX } from "solid-js";

export const Modal = (props: {
	isOpen?: boolean;
	children: JSX.Element;
	onClose: () => void;
	disableClose?: boolean;
	class?: string;
}) => {
	const service = useMachine(dialog.machine, { id: "1" });

	const api = dialog.connect(service, normalizeProps);

	createEffect(() => {
		if (props.isOpen) {
			api.setOpen(true);
		} else {
			api.setOpen(false);
		}
	});

	return null;
};
