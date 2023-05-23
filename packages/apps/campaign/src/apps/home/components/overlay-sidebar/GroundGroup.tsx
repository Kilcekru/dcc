import * as Components from "@kilcekru/dcc-lib-components";
import { createEffect, createMemo, For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { RunningCampaignState } from "../../../../logic/types";
import { getCoalitionFaction } from "../../../../logic/utils";
import { Flag } from "./Flag";
import { GroundGroupUnit } from "./GroundGroupUnit";
import Styles from "./Item.module.less";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";
import { useOverlayClose } from "./utils";

export function GroundGroup() {
	const [state] = useContext(CampaignContext);
	const [overlayStore] = useContext(OverlaySidebarContext);
	const onClose = useOverlayClose();

	const faction = createMemo(() => {
		const coalition = overlayStore.coalition;

		if (coalition == null) {
			return undefined;
		}
		return getCoalitionFaction(coalition, state as RunningCampaignState);
	});

	const groundGroup = createMemo(() => {
		const groundGroupId = overlayStore.groundGroupId;

		if (overlayStore.state === "ewr") {
			return faction()?.ews.find((gg) => gg.id === groundGroupId);
		}
		return faction()?.groundGroups.find((gg) => gg.id === groundGroupId);
	});

	// Close if the ground group is removed
	createEffect(() => {
		if (groundGroup() == null) {
			onClose();
		}
	});

	return (
		<Show when={groundGroup() != null}>
			<div>
				<Flag countryName={faction()?.countryName} />
				<h2 class={Styles.title}>{groundGroup()?.objective.name}</h2>
				<Show when={overlayStore.state === "ewr"}>
					<h3 class={Styles.subtitle}>Early Warning Radar</h3>
				</Show>
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
