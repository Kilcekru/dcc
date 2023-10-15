import { createContext, JSX, useContext } from "solid-js";
import { createStore } from "solid-js/store";

interface ModalState {
	isPersistanceModalOpen: boolean;
	isPersistanceIgnored: boolean;
}

const initState: ModalState = {
	isPersistanceModalOpen: false,
	isPersistanceIgnored: false,
};

type Store = [
	ModalState,
	{
		setIsPersistanceModalOpen?: (open: boolean) => void;
	},
];

export const ModalContext = createContext<Store>([initState, {}]);

export function ModalProvider(props: { children?: JSX.Element }) {
	const [state, setState] = createStore<ModalState>(initState);

	const store: Store = [
		state,
		{
			setIsPersistanceModalOpen: (open) => {
				setState("isPersistanceModalOpen", open);
				if (!open) {
					setState("isPersistanceIgnored", true);
				}
			},
		},
	];

	return <ModalContext.Provider value={store}>{props.children}</ModalContext.Provider>;
}

export function useModalContext() {
	const [state] = useContext(ModalContext);
	if (state == undefined) {
		throw Error("useModalContext needs to be within the ModalProvider");
	}
	return state;
}

export function useSetIsPersistanceModalOpen() {
	const [, { setIsPersistanceModalOpen }] = useContext(ModalContext);
	if (setIsPersistanceModalOpen == undefined) {
		throw Error("useSetPersistanceModalOpen needs to be within the ModalProvider");
	}
	return setIsPersistanceModalOpen;
}
