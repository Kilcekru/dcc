import { useStore } from "@kilcekru/dcc-lib-components";
import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import * as React from "react";
import { useEffect } from "react";

import { userConfigStore } from "../stores/user-config";
import { loadUserConfig } from "../utils";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	const userConfig = useStore(userConfigStore, (state) => state.config);
	const navigate = useNavigate();

	useEffect(() => {
		void loadUserConfig();
	}, []);

	useEffect(() => {
		if (userConfig?.setupComplete === false) {
			void navigate({ to: "/onboarding" });
		}
	}, [userConfig]);

	return (
		<div className="w-full h-full dark dark:bg-black flex flex-col text-white">
			{userConfig == null ? <div>Loading...</div> : <Outlet />}
			<TanStackRouterDevtools />
		</div>
	);
}
