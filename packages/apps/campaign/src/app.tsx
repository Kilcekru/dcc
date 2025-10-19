import { onEvent, rpc } from "@kilcekru/dcc-lib-rpc";
import * as Types from "@kilcekru/dcc-shared-types";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useSelector } from "@xstate/store/react";
import { enableMapSet } from "immer";
import * as React from "react";

import { Config } from "./data/config";
import { routerRecord } from "./router";
import { campaignStore } from "./stores/campaign";
import { routerStore } from "./stores/router";
import { onWorkerEvent, sendWorkerMessage, Triggers } from "./worker";

enableMapSet();

const queryClient = new QueryClient();

function Content() {
	const currentRoute = useSelector(routerStore, (state) => state.context.current);
	const resumeCampaign = useQuery({
		queryKey: ["savedState"],
		queryFn: async () => {
			const result = await rpc.campaign.resumeCampaign(Config.campaignVersion);
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
		routerStore.trigger.push({ path: "error" });
	}

	React.useEffect(() => {
		if (resumeCampaign.isSuccess && campaignList.isSuccess) {
			if (resumeCampaign.data == null) {
				// No resume campaign available, check if other save games exist
				if (campaignList.data.length > 0) {
					routerStore.trigger.push({ path: "open" });
				} else {
					routerStore.trigger.push({ path: "create" });
				}
			} else {
				Triggers.load({ ...resumeCampaign.data });
				routerStore.trigger.push({ path: "home" });
			}
		}
	}, [location.pathname, resumeCampaign.isSuccess, resumeCampaign.data, campaignList.isSuccess, campaignList.data]);

	return (
		<div className="w-full h-full dark dark:bg-black flex flex-col text-white">
			{currentRoute?.path == null ? null : routerRecord[currentRoute.path]}
		</div>
	);
}

export function App() {
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
			routerStore.trigger.push({ path: "create" });
		});
		onEvent("menu.campaign.open", () => {
			sendWorkerMessage({
				name: "closeCampaign",
			});
			campaignStore.trigger.reset();
			routerStore.trigger.push({ path: "open" });
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
