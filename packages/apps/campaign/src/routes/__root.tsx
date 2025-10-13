import { rpc } from "@kilcekru/dcc-lib-rpc";
import * as Types from "@kilcekru/dcc-shared-types";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { enableMapSet } from "immer";
import * as React from "react";

import { Config } from "../data/config";
import { campaignStore } from "../stores/campaign";
import { onWorkerEvent, Triggers } from "../worker";

enableMapSet();

export const Route = createRootRoute({
	component: RootComponent,
});

const queryClient = new QueryClient();

function Content() {
	const navigate = useNavigate();

	const resumeCampaign = useQuery({
		queryKey: ["savedState"],
		queryFn: () => rpc.campaign.resumeCampaign(Config.campaignVersion),
	});

	if (resumeCampaign.isError) {
		void navigate({ to: "/error" });
	}

	React.useEffect(() => {
		if (resumeCampaign.isSuccess) {
			if (resumeCampaign.data == null) {
				void navigate({ to: "/create/scenario" });
			} else {
				Triggers.load({ ...resumeCampaign.data });
				void navigate({ to: "/home" });
			}
		}
	}, [resumeCampaign.isSuccess, resumeCampaign.data, navigate]);

	return (
		<div className="w-full h-full dark dark:bg-black flex flex-col text-white">
			<Outlet />
			<TanStackRouterDevtools />
		</div>
	);
}

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
			<Content />
		</QueryClientProvider>
	);
}
