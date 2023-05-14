import * as Components from "@kilcekru/dcc-lib-components";
import { createMemo, For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { RunningCampaignState } from "../../../../logic/types";
import { getCoalitionFaction } from "../../../../logic/utils";
import { Flag } from "./Flag";
import { GroundGroupUnit } from "./GroundGroupUnit";
import Style from "./Item.module.less";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";

export function GroundGroup() {
	const [state] = useContext(CampaignContext);
	const [overlayStore] = useContext(OverlaySidebarContext);

	const faction = createMemo(() => {
		const coalition = overlayStore.coalition;

		if (coalition == null) {
			return undefined;
		}
		return getCoalitionFaction(coalition, state as RunningCampaignState);
	});

	const groundGroup = createMemo(() => {
		const groundGroupId = overlayStore.groundGroupId;

		const gg = faction()?.groundGroups.find((gg) => gg.id === groundGroupId);

		return gg;
	});

	return (
		<Show when={groundGroup() != null}>
			<div>
				<Flag countryName={faction()?.countryName} />
				<h2 class={Style.title}>{groundGroup()?.objective.name}</h2>
			</div>
			<Components.ScrollContainer>
				<Components.List>
					<For each={groundGroup()?.unitIds}>
						{(unitId) => <GroundGroupUnit unitId={unitId} coalition={overlayStore.coalition ?? "blue"} />}
					</For>
				</Components.List>
			</Components.ScrollContainer>
		</Show>
	);
}
