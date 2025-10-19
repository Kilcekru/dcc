import { rpc } from "@kilcekru/dcc-lib-rpc";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useSelector } from "@xstate/store/react";
import React from "react";

import { routerRecord } from "./router";
import { routerStore } from "./stores/router";
import { userConfigStore } from "./stores/user-config";

const queryClient = new QueryClient();

function Content() {
	const userConfigQuery = useQuery({
		queryKey: ["userConfig"],
		queryFn: async () => {
			const result = await rpc.misc.getUserConfig();
			return result ?? null;
		},
	});

	React.useEffect(() => {
		if (userConfigQuery.isSuccess) {
			userConfigStore.trigger.set({
				config: userConfigQuery.data,
			});

			if (userConfigQuery.data.setupComplete === false) {
				routerStore.trigger.push({ path: "onboarding" });
			} else {
				routerStore.trigger.push({ path: "home" });
			}
		}
	}, [userConfigQuery.isSuccess]);

	const currentRoute = useSelector(routerStore, (state) => state.context.current);
	return (
		<div className="w-full h-full dark dark:bg-black flex flex-col text-white">
			{userConfigQuery.isSuccess && currentRoute?.path != null ? (
				routerRecord[currentRoute.path]
			) : (
				<div>Loading...</div>
			)}
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
