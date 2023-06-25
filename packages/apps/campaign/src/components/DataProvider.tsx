import type * as DcsJs from "@foxdelta2/dcsjs";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createContext, createEffect, JSX, useContext } from "solid-js";
import { createStore } from "solid-js/store";

const initState: DataStore = {
	map: "caucasus",
	airdromes: undefined,
	objectives: undefined,
	strikeTargets: undefined,
	groundUnitsTemplates: undefined,
	samTemplates: undefined,
	vehicles: undefined,
	aircrafts: undefined,
	structures: undefined,
	callSigns: undefined,
	launchers: undefined,
	weapons: undefined,
};

type Store = [
	DataStore,
	{
		getData?: () => void;
		setMap?: (name: DcsJs.MapName) => void;
	}
];

export const DataContext = createContext<Store>([initState, {}]);

export function useDataStore() {
	const [dataStore] = useContext(DataContext);

	if (dataStore == null) {
		throw Error("useDataStore needs to be within the DataProvider");
	}
	return dataStore;
}

export function useSetDataMap() {
	const [, { setMap }] = useContext(DataContext);

	if (setMap == null) {
		throw Error("useSetDataMap needs to be within the DataProvider");
	}

	return setMap;
}

export function DataProvider(props: { children?: JSX.Element }) {
	const [state, setState] = createStore<DataStore>(initState);

	const store: Store = [
		state,
		{
			setMap: (name) => setState("map", name),
		},
	];

	createEffect(() => {
		const getData = async () => {
			const data = await rpc.campaign.getDataStore(state.map);
			setState(data);
		};
		void getData();
	});

	return <DataContext.Provider value={store}>{props.children}</DataContext.Provider>;
}
