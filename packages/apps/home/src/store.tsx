import { rpc } from "@kilcekru/dcc-lib-rpc";
import { UserConfig } from "@kilcekru/dcc-shared-rpc-types";
import { createContext, JSX, onMount, useContext } from "solid-js";
import { createStore } from "solid-js/store";

type Action = "settings";

interface State {
	loading?: boolean;
	error?: Error;
	action?: Action;
	userConfig?: Partial<UserConfig>;
}

type Store = [
	State,
	{
		setError?: (err: Error | undefined) => void;
		setAction?: (action: Action | undefined) => void;
		loadUserConfig?: () => Promise<void>;
	}
];

export const StoreContext = createContext<Store>([{}, {}]);

export function StoreProvider(props: { children?: JSX.Element }) {
	const [state, setState] = createStore<State>({ loading: true });

	const setError = (err?: Error) => setState("error", err);
	const setAction = (action?: Action) => setState("action", action);

	const loadUserConfig = async () => {
		try {
			const config = await rpc.misc.getUserConfig();
			setState("userConfig", config);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Unknown error";
			setError(new Error(`getUserConfig failed: ${msg}`));
		}
	};

	const store: Store = [
		state,
		{
			setError,
			setAction,
			loadUserConfig,
		},
	];

	onMount(() => {
		const action = new URLSearchParams(window.location.search).get("action");
		if (action === "settings") {
			setState("action", action);
		}

		void loadUserConfig().then(() => {
			setState("loading", false);
		});
	});

	return <StoreContext.Provider value={store}>{props.children}</StoreContext.Provider>;
}

export function useStore() {
	const [state] = useContext(StoreContext);
	return state;
}

export function useError() {
	const [{ error }] = useContext(StoreContext);
	return error;
}

export function useAction() {
	const [{ action }] = useContext(StoreContext);
	return action;
}

export function useUserConfig() {
	const [{ userConfig }] = useContext(StoreContext);
	return userConfig;
}

export function useSetError() {
	const [, { setError }] = useContext(StoreContext);
	if (setError == undefined) {
		throw new Error("StoreContext.setError is undefined");
	}
	return setError;
}

export function useSetAction() {
	const [, { setAction }] = useContext(StoreContext);
	if (setAction == undefined) {
		throw new Error("StoreContext.setAction is undefined");
	}
	return setAction;
}

export function useLoadUserConfig() {
	const [, { loadUserConfig }] = useContext(StoreContext);
	if (loadUserConfig == undefined) {
		throw new Error("StoreContext.loadUserConfig is undefined");
	}
	return loadUserConfig;
}
