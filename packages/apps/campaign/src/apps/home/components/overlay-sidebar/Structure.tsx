import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { createEffect, createMemo, For, Show, useContext } from "solid-js";

import { formatPercentage } from "../../../../../../../libs/components/src/utils";
import { CampaignContext } from "../../../../components";
import { RunningCampaignState } from "../../../../logic/types";
import { getCoalitionFaction } from "../../../../logic/utils";
import { getDeploymentCost, hasAmmoDepotInRange, hasFuelStorageInRange, hasPowerInRange } from "../../../../utils";
import { Flag } from "./Flag";
import Styles from "./Item.module.less";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";
import { StructureBuilding } from "./StructureBuilding";
import { useOverlayClose } from "./utils";

export function Structure() {
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

	const structure = createMemo(() => {
		const name = overlayStore.structureName;

		if (name == null) {
			return undefined;
		}

		const str = faction()?.structures[name];

		if (str == null) {
			// eslint-disable-next-line no-console
			console.error("Structure: structure not found");
			return undefined;
		}

		return str;
	});

	// Close if the structure is removed
	createEffect(() => {
		if (structure() == null) {
			onClose();
		}
	});

	return (
		<Show when={structure() != null}>
			<div>
				<Flag countryName={faction()?.countryName} />
				<h2 class={Styles.title}>{structure()?.objectiveName}</h2>
				<h3 class={Styles.subtitle}>{structure()?.type}</h3>
				<div class={Styles.stats}>
					<Components.Stat>
						<Components.StatLabel>Status</Components.StatLabel>
						<Components.StatValue>{structure()?.state === "active" ? "Active" : "Inactive"}</Components.StatValue>
					</Components.Stat>
					<Show when={structure()?.type === "Barrack" || structure()?.type === "Depot"}>
						<Components.Stat>
							<Components.StatLabel>Power</Components.StatLabel>
							<Components.StatValue>
								{hasPowerInRange(structure()?.position, faction()) ? "Active" : "Inactive"}
							</Components.StatValue>
						</Components.Stat>
					</Show>
					<Show when={structure()?.type === "Barrack" || structure()?.type === "Depot"}>
						<Components.Stat>
							<Components.StatLabel>Ammo</Components.StatLabel>
							<Components.StatValue>
								{hasAmmoDepotInRange(structure()?.position, faction()) ? "Active" : "Inactive"}
							</Components.StatValue>
						</Components.Stat>
					</Show>
					<Show when={structure()?.type === "Depot"}>
						<Components.Stat>
							<Components.StatLabel>Fuel</Components.StatLabel>
							<Components.StatValue>
								{hasFuelStorageInRange(structure()?.position, faction()) ? "Active" : "Inactive"}
							</Components.StatValue>
						</Components.Stat>
					</Show>
					<Show when={structure()?.type === "Barrack" || structure()?.type === "Depot"}>
						<Components.Stat>
							<Components.StatLabel>Deployment Score</Components.StatLabel>
							<Components.StatValue>
								{formatPercentage(
									((structure() as DcsJs.StructureUnitCamp).deploymentScore /
										getDeploymentCost(overlayStore.coalition, structure()?.type)) *
										100,
								)}
							</Components.StatValue>
						</Components.Stat>
					</Show>
				</div>
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
