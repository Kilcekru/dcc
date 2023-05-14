import { normalizeProps, useMachine } from "@zag-js/solid";
import * as toast from "@zag-js/toast";
import { createContext, createMemo, createUniqueId, For, JSXElement, useContext } from "solid-js";

import { Toast } from "./Toast";

// 2. Create the toast context
const ToastContext = createContext<ReturnType<typeof toast.group.connect>>();
export const useToast = () => {
	const context = useContext(ToastContext);

	if (context == null) {
		throw new Error("Toast Context not found");
	}

	return context;
};

export const useCreateToast = () => {
	const toast = useToast();

	return ({ title, description }: { title?: string; description?: string }) => {
		toast.create({
			title,
			description,
			duration: 5000,
			placement: "top-end",
		});
	};
};

export const useCreateErrorToast = () => {
	const toast = useToast();

	return ({ title, description }: { title?: string; description?: string }) => {
		toast.create({
			title,
			description,
			duration: 5000,
			placement: "top-end",
			type: "error",
		});
	};
};

// 3. Create the toast group provider
export function ToastProvider(props: { children?: JSXElement }) {
	const [state, send] = useMachine(toast.group.machine({ id: createUniqueId() }));

	const api = createMemo(() => toast.group.connect(state, send, normalizeProps));

	return (
		// eslint-disable-next-line solid/reactivity
		<ToastContext.Provider value={api()}>
			<For each={Object.entries(api().toastsByPlacement)}>
				{([placement, toasts]) => (
					<div {...api().getGroupProps({ placement: placement as toast.Placement })}>
						<For each={toasts}>{(toast) => <Toast actor={toast} />}</For>
					</div>
				)}
			</For>

			{props.children}
		</ToastContext.Provider>
	);
}
