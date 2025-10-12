import { rpc } from "@kilcekru/dcc-lib-rpc";
import * as Types from "@kilcekru/dcc-shared-types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { enableMapSet } from "immer";
import * as React from "react";

import { campaignStore } from "../stores/campaign";
import { onWorkerEvent } from "../worker";

enableMapSet();

export const Route = createRootRoute({
	component: RootComponent,
});

const queryClient = new QueryClient();

function RootComponent() {
	const saveCampaign = React.useCallback(async function saveCampaign(state: Types.Campaign.WorkerState) {
		// eslint-disable-next-line no-console
		console.log("saveCampaign", state);
		await rpc.campaign
			.saveCampaign(state)
			// eslint-disable-next-line no-console
			.catch((e) => console.error(e instanceof Error ? e.message : "unknown error"));
	}, []);

	React.useEffect(() => {
		const serializedSubscription = onWorkerEvent("serialized", async (event: Types.Campaign.WorkerEventSerialized) => {
			void saveCampaign(event.state);
		});
		const stateUpdateSubscription = onWorkerEvent(
			"stateUpdate",
			async (event: Types.Campaign.WorkerEventStateUpdate) => {
				// eslint-disable-next-line no-console
				console.log("stateUpdate", event.state);
				campaignStore.trigger.update({ campaign: event.state });
			},
		);
		const timeUpdateSubscription = onWorkerEvent("timeUpdate", (event: Types.Campaign.WorkerEventTimeUpdate) => {
			campaignStore.trigger.updateTime({ time: event.time });
		});
		return () => {
			serializedSubscription.dispose();
			stateUpdateSubscription.dispose();
			timeUpdateSubscription.dispose();
		};
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<div className="w-full h-full dark dark:bg-black flex flex-col text-white">
				<Outlet />
				<TanStackRouterDevtools />
			</div>
		</QueryClientProvider>
	);
}
