import { createMemo, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { RunningCampaignState } from "../../../../logic/types";
import { getCoalitionFaction } from "../../../../logic/utils";
import { Flag } from "./Flag";
import Style from "./Item.module.less";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";

export function DownedPilot() {
	const [state] = useContext(CampaignContext);
	const [overlayStore] = useContext(OverlaySidebarContext);

	const faction = createMemo(() => {
		const coalition = overlayStore.coalition;

		if (coalition == null) {
			return undefined;
		}
		return getCoalitionFaction(coalition, state as RunningCampaignState);
	});

	return (
		<div>
			<Flag countryName={faction()?.countryName} />
			<h2 class={Style.title}>
				Pilot {faction()?.downedPilots.find((p) => p.id === overlayStore.groundGroupId)?.name}
			</h2>
		</div>
	);
}
