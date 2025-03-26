import { createContext, useContext, useState, useSyncExternalStore } from "react";

export class Store<TData> {
	#data: TData = {} as TData;
	#listeners: Set<(data: TData) => void> = new Set();

	public constructor(data: TData) {
		this.#data = Object.freeze(data);
	}

	public set(data: Partial<TData> | ((data: Readonly<TData>) => Partial<TData>)) {
		this.#data = Object.freeze({
			...this.#data,
			...(typeof data === "function" ? data(this.#data) : data),
		});

		for (const listener of this.#listeners) {
			listener(this.get());
		}
	}

	public get(): Readonly<TData> {
		return this.#data;
	}

	public subscribe(listener: (state: Readonly<TData>) => void) {
		this.#listeners.add(listener);

		return () => this.#listeners.delete(listener);
	}
}

export function createStore<TData>(initialData: TData) {
	return new Store<TData>(initialData);
}

export function useCreateStore<TData>(initialData: TData) {
	const [store] = useState<Store<TData>>(createStore(initialData));

	return store;
}

export function useStore<TData, SelectorOutput>(
	store: Store<TData>,
	selector: (store: Readonly<TData>) => SelectorOutput,
): SelectorOutput {
	if (store == null) {
		throw new Error("Store not found");
	}

	const state = useSyncExternalStore(
		(args) => store.subscribe(args),
		() => selector(store.get()),
	);

	return state;
}

export function createStoreContext<TData>(initialData: TData) {
	const StoreContext = createContext<Store<TData> | undefined>(undefined);

	function Provider({ children }: React.PropsWithChildren<unknown>) {
		const store = useCreateStore(initialData);
		return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
	}

	function useContextStore() {
		const contextStore = useContext(StoreContext);
		if (contextStore == null) {
			throw new Error("Store not found");
		}

		return contextStore;
	}

	function useContextSelector<SelectorOutput>(selector: (store: Readonly<TData>) => SelectorOutput): SelectorOutput {
		const store = useContextStore();

		return useStore(store, selector);
	}

	return { Provider, useContextSelector, useContextStore };
}
