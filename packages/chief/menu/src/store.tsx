import * as Types from "@kilcekru/dcc-shared-types";
import { createContext, JSX, onMount, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import * as IPC from "./ipc";

interface State {
	expanded: boolean;
	config?: Types.AppMenu.Config;
}

type Store = [
	State,
	{
		setExpanded?: (expanded: boolean) => void;
	},
];

export const StoreContext = createContext<Store>([{ expanded: false }, {}]);

export function StoreProvider(props: { children?: JSX.Element }) {
	const [state, setState] = createStore<State>({ expanded: false });

	onMount(async () => {
		const config = await IPC.getConfig();
		setState({ config });

		IPC.onConfigChanged((config) => {
			setState({ config });
		});
	});

	const setExpanded = (expanded: boolean) => {
		if (expanded !== state.expanded) {
			setState("expanded", expanded);
			if (expanded) {
				IPC.expand();
			} else {
				IPC.collapse();
			}
		}
	};

	const store: Store = [state, { setExpanded }];

	return <StoreContext.Provider value={store}>{props.children}</StoreContext.Provider>;
}

export function useState() {
	const [state] = useContext(StoreContext);
	return state;
}

export function useSetExpanded() {
	const [, { setExpanded }] = useContext(StoreContext);
	if (setExpanded == undefined) {
		throw new Error("useSetExpanded must be calles inside a StoreProvider");
	}
	return setExpanded;
}
