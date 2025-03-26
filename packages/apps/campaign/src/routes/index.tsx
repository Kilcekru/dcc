import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { routerStore } from "../stores/router";
import { Triggers } from "../worker";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { Config } from "../data/config";

async function loadCampaign() {
	try {
		// Load the campaign state from persistence
		const campaign = await rpc.campaign.resumeCampaign(Config.campaignVersion);

		// eslint-disable-next-line no-console
		console.log("campaign loaded", campaign);

		// If no campaign is found, we need to create a new one
		if (campaign == null) {
			console.log("campaign is null");
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
	const navigate = useNavigate();
	React.useEffect(() => {
		async function load() {
			const status = await loadCampaign();
			console.log("status", status);
			if (status === "ready") {
				navigate({ to: "/home" });
			} else if (status === "create") {
				navigate({ to: "/create/scenario" });
			} else if (status === "error") {
				navigate({ to: "/error" });
			}
		}

		load();
	}, []);

	return (
		<div className="p-2">
			<h3>Welcome Home!</h3>
		</div>
	);
}
