import type * as DcsJs from "@foxdelta2/dcsjs";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import * as Types from "@kilcekru/dcc-shared-types";
import { createContext, createEffect, JSX, useContext } from "solid-js";
import { createStore } from "solid-js/store";

const initState: Types.Campaign.DataStore = {
	map: "caucasus",
	mapInfo: undefined,
	airdromes: undefined,
	objectives: undefined,
	tasks: undefined,
	strikeTargets: undefined,
	groundUnitsTemplates: undefined,
	samTemplates: undefined,
	vehicles: undefined,
	aircrafts: undefined,
	structures: undefined,
	callSigns: undefined,
	launchers: undefined,
	weapons: undefined,
	ships: undefined,
};

type Store = [
	Types.Campaign.DataStore,
	{
		getData?: () => void;
		setMap?: (name: DcsJs.MapName) => void;
		setFactions?: (factions: Array<DcsJs.FactionDefinition>) => void;
	},
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

export function useSetFactions() {
	const [, { setFactions }] = useContext(DataContext);

	if (setFactions == null) {
		throw Error("useSetFactions needs to be within the DataProvider");
	}

	return setFactions;
}

export function DataProvider(props: { children?: JSX.Element }) {
	const [state, setState] = createStore<Types.Campaign.DataStore>(initState);

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
