import { rpc } from "@kilcekru/dcc-lib-rpc";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { createSignal, onMount, Show, useContext } from "solid-js";

import { CreateCampaign, Home } from "./apps";
import { CampaignContext, CampaignProvider } from "./components";
import { DataProvider } from "./components/DataProvider";
import { isEmpty } from "./utils";

const App = () => {
	const [state] = useContext(CampaignContext);
	return (
		<Show when={state.active === true} fallback={<CreateCampaign />}>
			<Home />
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
					setCampaignState(null);
				} else {
					setCampaignState(loadedState);
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
					<App />
				</CampaignProvider>
			</DataProvider>
		</Show>
	);
};

export { AppWithContext as App };
