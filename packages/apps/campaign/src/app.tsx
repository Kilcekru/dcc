import { rpc } from "@kilcekru/dcc-lib-rpc";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useSelector } from "@xstate/store/react";
import { enableMapSet } from "immer";
import * as React from "react";

import { Config } from "./data/config";
import { routerRecord } from "./router";
import { registerRpcEventListeners } from "./rpc-event-listeners";
import { routerStore } from "./stores/router";
import { Triggers } from "./worker";

enableMapSet();
registerRpcEventListeners();

const queryClient = new QueryClient();

function Content() {
	const currentRoute = useSelector(routerStore, (state) => state.context.current);
	const didInitRef = React.useRef(false);
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
		if (didInitRef.current) return;
		if (resumeCampaign.isSuccess && campaignList.isSuccess) {
			didInitRef.current = true;
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
	}, [resumeCampaign.isSuccess, resumeCampaign.data, campaignList.isSuccess, campaignList.data]);

	return (
		<div className="w-full h-full dark dark:bg-black flex flex-col text-white">
			{currentRoute?.path == null ? null : routerRecord[currentRoute.path]}
		</div>
	);
}

export function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Content />
		</QueryClientProvider>
	);
}
