import * as Components from "@kilcekru/dcc-lib-components";
import { createMemo, For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { RunningCampaignState } from "../../../../logic/types";
import { getCoalitionFaction } from "../../../../logic/utils";
import { Flag } from "./Flag";
import { FlightGroupUnit } from "./FlightGroupUnit";
import Style from "./Item.module.less";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";

export function FlightGroup() {
	const [state] = useContext(CampaignContext);
	const [overlayStore] = useContext(OverlaySidebarContext);

	const faction = createMemo(() => {
		const coalition = overlayStore.coalition;

		if (coalition == null) {
			return undefined;
		}
		return getCoalitionFaction(coalition, state as RunningCampaignState);
	});

	const flightGroup = createMemo(() => {
		const flightGroupId = overlayStore.flightGroupId;
		const pkg = faction()?.packages.find((pkg) => pkg.flightGroups.some((f) => f.id === flightGroupId));

		if (pkg == null) {
			return;
		}

		return pkg.flightGroups.find((f) => f.id === flightGroupId);
	});

	return (
		<Show when={flightGroup() != null}>
			<div>
				<Flag countryName={faction()?.countryName} />
				<h2 class={Style.title}>{flightGroup()?.name}</h2>
				<Components.TaskLabel task={flightGroup()?.task ?? "CAP"} class={Style.task} />
			</div>
			<Components.ScrollContainer>
				<Components.List>
					<For each={flightGroup()?.units}>
						{(unit) => (
							<Components.ListItem>
								<FlightGroupUnit unit={unit} coalition={overlayStore.coalition ?? "blue"} />
							</Components.ListItem>
						)}
					</For>
				</Components.List>
			</Components.ScrollContainer>
		</Show>
	);
}
