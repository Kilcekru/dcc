import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { onEvent, rpc } from "@kilcekru/dcc-lib-rpc";
import { createSignal, ErrorBoundary, Match, onMount, Show, Switch, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { CreateCampaign, Home } from "./apps";
import { CampaignContext, CampaignProvider } from "./components";
import { DataProvider, useSetDataMap } from "./components/DataProvider";
import { isEmpty } from "./utils";

const App = () => {
	const [state] = useContext(CampaignContext);

	onEvent("menu.dev.logState", () => {
		console.log(unwrap(state)); // eslint-disable-line no-console
	});

	return (
		<Show when={state.loaded}>
			<Switch fallback={<div>Not Found</div>}>
				<Match when={state.active === true}>
					<Home />
				</Match>
				<Match when={state.active === false}>
					<CreateCampaign />
				</Match>
			</Switch>
		</Show>
	);
};

const AppWithContext = () => {
	const [campaignState, setCampaignState] = createSignal<Partial<DcsJs.CampaignState> | null | undefined>(undefined);
	const setDataMap = useSetDataMap();

	onMount(() => {
		rpc.campaign
			.load()
			.then((loadedState) => {
				console.log("load", loadedState); // eslint-disable-line no-console
				if (isEmpty(loadedState)) {
					setCampaignState({
						loaded: true,
					});
				} else {
					if (loadedState.map != null) {
						setDataMap(loadedState.map);
					}
					setCampaignState({
						...loadedState,
						loaded: true,
					});
				}
			})
			.catch((err) => {
				console.log("RPC error", err); // eslint-disable-line no-console
			});
	});

	return (
		<Show when={campaignState !== undefined} fallback={<div>Loading...</div>}>
			<CampaignProvider campaignState={campaignState()}>
				<ErrorBoundary fallback={<div>Something went wrong</div>}>
					<App />
				</ErrorBoundary>
			</CampaignProvider>
		</Show>
	);
};

const AppWithData = () => {
	return (
		<Components.ToastProvider>
			<DataProvider>
				<AppWithContext />
			</DataProvider>
		</Components.ToastProvider>
	);
};

export { AppWithData as App };
