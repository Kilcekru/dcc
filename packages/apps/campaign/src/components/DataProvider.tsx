import { rpc } from "@kilcekru/dcc-lib-rpc";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createContext, createEffect, JSX } from "solid-js";
import { createStore } from "solid-js/store";

const initState: DataStore = {
	airdromes: undefined,
	objectives: undefined,
	strikeTargets: undefined,
	samTemplates: undefined,
	vehicles: undefined,
	aircrafts: undefined,
	structures: undefined,
	farps: undefined,
	callSigns: undefined,
};

export const DataContext = createContext<DataStore>(initState);

export function DataProvider(props: { children?: JSX.Element }) {
	const [state, setState] = createStore<DataStore>(initState);

	createEffect(() => {
		const getData = async () => {
			const data = await rpc.campaign.getDataStore();

			setState(data);
		};
		void getData();
	});

	return <DataContext.Provider value={state}>{props.children}</DataContext.Provider>;
}
