import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { createSignal, Match, onMount, Show, Switch, useContext } from "solid-js";

import { CreateCampaign, Home } from "./apps";
import { CampaignContext, CampaignProvider } from "./components";
import { DataProvider } from "./components/DataProvider";
import { isEmpty } from "./utils";

const App = () => {
	const [state] = useContext(CampaignContext);

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
	const [campaignState, setCampaignState] = createSignal<Partial<CampaignState> | null | undefined>(undefined);

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
			<DataProvider>
				<CampaignProvider campaignState={campaignState()}>
					<Components.ToastProvider>
						<App />
					</Components.ToastProvider>
				</CampaignProvider>
			</DataProvider>
		</Show>
	);
};

export { AppWithContext as App };
