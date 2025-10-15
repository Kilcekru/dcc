import { onEvent, rpc } from "@kilcekru/dcc-lib-rpc";
import * as Types from "@kilcekru/dcc-shared-types";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { createRootRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { enableMapSet } from "immer";
import * as React from "react";

import { Config } from "../data/config";
import { campaignStore } from "../stores/campaign";
import { onWorkerEvent, sendWorkerMessage, Triggers } from "../worker";

enableMapSet();

export const Route = createRootRoute({
	component: RootComponent,
});

const queryClient = new QueryClient();

function Content() {
	const navigate = useNavigate();
	const { location } = useRouterState();

	const resumeCampaign = useQuery({
		queryKey: ["savedState"],
		queryFn: async () => {
			const result = await rpc.campaign.resumeCampaign(Config.campaignVersion)
			return result ?? null;
		},
	});

	const campaignList = useQuery({
		queryKey: ["campaigns"],
		queryFn: async () => {
			const list = await rpc.campaign.loadCampaignList();
			return Object.values(list);
		},
	});

	if (resumeCampaign.isError) {
		void navigate({ to: "/error" });
	}

	React.useEffect(() => {
		const isOnRedirectablePage = location.pathname === "/" || location.pathname === "/error";

		if (resumeCampaign.isSuccess && campaignList.isSuccess && isOnRedirectablePage) {
			if (resumeCampaign.data == null) {
				// No resume campaign available, check if other save games exist
				if (campaignList.data.length > 0) {
					void navigate({ to: "/open" });
				} else {
					void navigate({ to: "/create/scenario" });
				}
			} else {
				Triggers.load({ ...resumeCampaign.data });
				void navigate({ to: "/home" });
			}
		}
	}, [location.pathname, resumeCampaign.isSuccess, resumeCampaign.data, campaignList.isSuccess, campaignList.data, navigate]);

	return (
		<div className="w-full h-full dark dark:bg-black flex flex-col text-white">
			<Outlet />
			<TanStackRouterDevtools />
		</div>
	);
}

function RootComponent() {
	const navigate = useNavigate();

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
				campaignStore.trigger.update({ uiState: event.state });
			},
		);
		const timeUpdateSubscription = onWorkerEvent("timeUpdate", (event: Types.Campaign.WorkerEventTimeUpdate) => {
			campaignStore.trigger.updateTime({ time: event.time });
		});

		onEvent("menu.campaign.new", () => {
			sendWorkerMessage({
				name: "closeCampaign",
			});
			campaignStore.trigger.reset();
			void navigate({ to: "/create/scenario" });
		});
		onEvent("menu.campaign.open", () => {
			sendWorkerMessage({
				name: "closeCampaign",
			});
			campaignStore.trigger.reset();
			void navigate({ to: "/open" });
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
