import * as Components from "@kilcekru/dcc-lib-components";
import { createMemo, For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { RunningCampaignState } from "../../../../logic/types";
import { getCoalitionFaction } from "../../../../logic/utils";
import { Flag } from "./Flag";
import Styles from "./Item.module.less";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";
import { StructureBuilding } from "./StructureBuilding";

export function Structure() {
	const [state] = useContext(CampaignContext);
	const [overlayStore] = useContext(OverlaySidebarContext);

	const faction = createMemo(() => {
		const coalition = overlayStore.coalition;

		if (coalition == null) {
			return undefined;
		}
		return getCoalitionFaction(coalition, state as RunningCampaignState);
	});

	const structure = createMemo(() => {
		const name = overlayStore.structureName;

		if (name == null) {
			return undefined;
		}

		const str = faction()?.structures[name];

		if (str == null) {
			throw "Structure: structure not found";
		}

		return str;
	});

	return (
		<Show when={structure() != null}>
			<div>
				<Flag countryName={faction()?.countryName} />
				<h2 class={Styles.title}>{structure()?.objectiveName}</h2>
				<h3 class={Styles.subtitle}>{structure()?.structureType}</h3>
			</div>
			<Components.ScrollContainer>
				<Components.List>
					<For each={structure()?.buildings}>
						{(building) => <StructureBuilding building={building} coalition={overlayStore.coalition ?? "blue"} />}
					</For>
				</Components.List>
			</Components.ScrollContainer>
		</Show>
	);
}
