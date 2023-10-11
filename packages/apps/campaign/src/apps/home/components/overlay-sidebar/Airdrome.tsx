import * as Components from "@kilcekru/dcc-lib-components";
import { createMemo, For, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { RunningCampaignState } from "../../../../logic/types";
import { getCoalitionFaction } from "../../../../logic/utils";
import { Aircraft } from "./Aircraft";
import { Flag } from "./Flag";
import Style from "./Item.module.less";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";

export function Airdrome() {
	const [state] = useContext(CampaignContext);
	const [overlayStore] = useContext(OverlaySidebarContext);

	const faction = createMemo(() => {
		const coalition = overlayStore.coalition;

		if (coalition == null) {
			return undefined;
		}
		return getCoalitionFaction(coalition, state as RunningCampaignState);
	});

	const aircrafts = createMemo(() => {
		const fac = faction();

		if (fac == null) {
			return;
		}

		return Object.values(fac.inventory.aircrafts).filter((ac) => ac.homeBase.name === overlayStore.name && ac.alive);
	});

	return (
		<>
			<div>
				<Flag countryName={faction()?.countryName} />
				<h2 class={Style.title}>{overlayStore.name}</h2>
			</div>
			<Components.ScrollContainer>
				<Components.List>
					<For each={aircrafts()}>
						{(unit) => (
							<Components.ListItem>
								<Aircraft unit={unit} />
							</Components.ListItem>
						)}
					</For>
				</Components.List>
			</Components.ScrollContainer>
		</>
	);
}
