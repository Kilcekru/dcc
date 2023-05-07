import { createMemo, For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { RunningCampaignState } from "../../../../logic/types";
import { getCoalitionFaction } from "../../../../logic/utils";
import { GroundGroupUnit } from "./GroundGroupUnit";
import Style from "./Item.module.less";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";

export function GroundGroup() {
	const [state] = useContext(CampaignContext);
	const [overlayStore] = useContext(OverlaySidebarContext);

	const groundGroup = createMemo(() => {
		const coalition = overlayStore.coalition;
		const groundGroupId = overlayStore.groundGroupId;

		if (coalition == null) {
			return undefined;
		}

		const faction = getCoalitionFaction(coalition, state as RunningCampaignState);

		const gg = faction.groundGroups.find((gg) => gg.id === groundGroupId);

		return gg;
	});

	return (
		<Show when={groundGroup() != null}>
			<div>
				<h2 class={Style.title}>{groundGroup()?.objective.name}</h2>
			</div>
			<For each={groundGroup()?.unitIds}>
				{(unitId) => <GroundGroupUnit unitId={unitId} coalition={overlayStore.coalition ?? "blue"} />}
			</For>
		</Show>
	);
}
