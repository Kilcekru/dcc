import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { createEffect, createMemo, For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { RunningCampaignState } from "../../../../logic/types";
import { getCoalitionFaction } from "../../../../logic/utils";
import { Flag } from "./Flag";
import Styles from "./Item.module.less";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";
import { SamUnit } from "./SamUnit";
import { useOverlayClose } from "./utils";

export function Sam() {
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

	const sam = createMemo(() => {
		const groundGroupId = overlayStore.groundGroupId;

		return faction()?.groundGroups.find((gg) => gg.id === groundGroupId) as DcsJs.SamGroup;
	});

	// Close if the sam is removed
	createEffect(() => {
		if (sam() == null) {
			onClose();
		}
	});

	return (
		<Show when={sam() != null}>
			<div>
				<Flag countryName={faction()?.countryName} />
				<h2 class={Styles.title}>{sam()?.objectiveName}</h2>
				<h3 class={Styles.subtitle}>{sam()?.type}</h3>
				<div class={Styles.stats}>
					<Components.Stat>
						<Components.StatLabel>Status</Components.StatLabel>
						<Components.StatValue>{sam()?.operational ? "Active" : "Inactive"}</Components.StatValue>
					</Components.Stat>
				</div>
			</div>
			<Components.ScrollContainer>
				<Components.List>
					<For each={sam()?.unitIds}>
						{(id) => <SamUnit unitId={id} coalition={overlayStore.coalition ?? "blue"} />}
					</For>
				</Components.List>
			</Components.ScrollContainer>
		</Show>
	);
}
