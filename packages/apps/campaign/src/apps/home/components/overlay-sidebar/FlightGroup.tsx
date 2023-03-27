import { createMemo, For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { RunningCampaignState } from "../../../../logic/types";
import { getCoalitionFaction } from "../../../../logic/utils";
import { FlightGroupUnit } from "./FlightGroupUnit";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";

export function FlightGroup() {
	const [state] = useContext(CampaignContext);
	const [overlayStore] = useContext(OverlaySidebarContext);

	const flightGroup = createMemo(() => {
		const coalition = overlayStore.coalition;
		const flightGroupId = overlayStore.flightGroupId;

		if (coalition == null || name == null) {
			return undefined;
		}

		const faction = getCoalitionFaction(coalition, state as RunningCampaignState);

		const pkg = faction.packages.find((pkg) => pkg.flightGroups.some((f) => f.id === flightGroupId));

		if (pkg == null) {
			return;
		}

		return pkg.flightGroups.find((f) => f.id === flightGroupId);
	});

	return (
		<Show when={flightGroup() != null}>
			<div>
				<h2>{flightGroup()?.name}</h2>
				<p>{flightGroup()?.task}</p>
			</div>
			<For each={flightGroup()?.units}>
				{(unit) => <FlightGroupUnit unit={unit} coalition={overlayStore.coalition ?? "blue"} />}
			</For>
		</Show>
	);
}
