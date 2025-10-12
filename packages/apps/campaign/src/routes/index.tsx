import { rpc } from "@kilcekru/dcc-lib-rpc";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";

import { Config } from "../data/config";
import { routerStore } from "../stores/router";
import { Triggers } from "../worker";

async function loadCampaign() {
	try {
		// Load the campaign state from persistence
		const campaign = await rpc.campaign.resumeCampaign(Config.campaignVersion);

		// eslint-disable-next-line no-console
		console.log("campaign loaded", campaign);

		// If no campaign is found, we need to create a new one
		if (campaign == null) {
			// eslint-disable-next-line no-console
			console.warn("campaign is null");
			routerStore.set({ route: "create" });
			return "create";
		}

		// Load the campaign state in the campaign logic worker
		Triggers.load({ ...campaign });
		return "ready";
	} catch (e) {
		console.error("Resume Campaign", e instanceof Error ? e.message : "unknown error"); // eslint-disable-line no-console
		return "error";
	}
}

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const loading = React.useRef(false);
	const navigate = useNavigate();

	async function load() {
		if (loading.current) return;
		loading.current = true;
		const status = await loadCampaign();

		switch (status) {
			case "create":
				void navigate({ to: "/create/scenario" });
				break;
			case "ready":
				void navigate({ to: "/home" });
				break;
			case "error":
				void navigate({ to: "/error" });
				break;
			default:
				break;
		}
	}

	function runInitialLoadEffect() {
		void load();
	}

	React.useEffect(runInitialLoadEffect, [navigate]);

	return (
		<div className="p-2">
			<h3>Welcome Home!</h3>
		</div>
	);
}
