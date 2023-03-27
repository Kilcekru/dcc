import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createMemo, For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { RunningCampaignState } from "../../../../logic/types";
import { getCoalitionFaction, isCampaignStructureUnitCamp, repairScoreCost } from "../../../../logic/utils";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";
import styles from "./Structure.module.less";

const staticTypeName: Record<DcsJs.StaticType, string> = {
	"Garage B": "Garage",
	"Tech hangar A": "Hangar",
	"Electric power box": "Power Box",
	"Repair workshop": "Repair Workshop",
};

const staticTypeImage: Record<DcsJs.StaticType, keyof typeof styles> = {
	"Garage B": "image-garage-b",
	"Tech hangar A": "image-tech-hangar-a",
	"Electric power box": "image-electric-power-box",
	"Repair workshop": "image-repair-workshop",
};

export function Structure() {
	const [state] = useContext(CampaignContext);
	const [overlayStore] = useContext(OverlaySidebarContext);

	const structure = createMemo(() => {
		const coalition = overlayStore.coalition;
		const name = overlayStore.structureName;

		if (coalition == null || name == null) {
			return undefined;
		}

		const faction = getCoalitionFaction(coalition, state as RunningCampaignState);
		const str = faction.structures[name];

		if (str == null) {
			throw "Structure: structure not found";
		}

		return str;
	});

	const deploymentScore = createMemo(() => {
		const str = structure();

		return isCampaignStructureUnitCamp(str) ? str.deploymentScore : undefined;
	});

	const unitCount = createMemo(() => {
		const str = structure();

		if (isCampaignStructureUnitCamp(str)) {
			let alive = 0;
			let destroyed = 0;

			str.buildings.forEach((building) => {
				if (building.alive) {
					alive++;
				} else {
					destroyed++;
				}
			});

			return {
				alive,
				destroyed,
			};
		}

		return undefined;
	});

	return (
		<Show when={structure() != null}>
			<div>
				<h2 class={cnb(styles.header, styles.objective)}>{structure()?.objectiveName}</h2>
				<h2 class={styles.header}>{structure()?.structureType}</h2>

				{deploymentScore == null ? null : <p>Deployment Score: {deploymentScore()}</p>}
				{unitCount() == null ? null : (
					<p>
						{unitCount()?.alive}({unitCount()?.destroyed})
					</p>
				)}
			</div>

			<div class={styles.buildings}>
				<For each={structure()?.buildings}>
					{(building) => {
						return (
							<div class={styles.building}>
								<div
									class={cnb(styles["building-image"], styles[staticTypeImage[building.type] ?? "image-garage-b"])}
								/>
								<p class={styles["building-name"]}>
									{staticTypeName[building.type] ?? "Garage"}
									{!building.alive ? (
										<>
											<br />
											<span>Destroyed</span>
										</>
									) : null}
								</p>
								{building.repairScore == null ? null : (
									<p>Repair: {Components.Utils.formatPercentage((building.repairScore / repairScoreCost) * 100)}</p>
								)}
							</div>
						);
					}}
				</For>
			</div>
		</Show>
	);
}
