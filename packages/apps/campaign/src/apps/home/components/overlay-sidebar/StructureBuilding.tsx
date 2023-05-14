import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { Show } from "solid-js";

import { repairScoreCost } from "../../../../logic/utils";
import Styles from "./Item.module.less";

const staticTypeName: Record<DcsJs.StaticType, string> = {
	"Garage B": "Garage",
	"Tech hangar A": "Hangar",
	"Electric power box": "Power Box",
	"Repair workshop": "Repair Workshop",
	"FARP Ammo Dump Coating": "Ammo Storage",
	"FARP CP Blindage": "Command Post",
	"FARP Fuel Depot": "Fuel Depot",
	"FARP Tent": "Tent",
	"Invisible FARP": "Heliport",
};

const staticTypeImage: Record<DcsJs.StaticType, keyof typeof Styles> = {
	"Garage B": "image-garage-b",
	"Tech hangar A": "image-tech-hangar-a",
	"Electric power box": "image-electric-power-box",
	"Repair workshop": "image-repair-workshop",
	"FARP Ammo Dump Coating": "image-farp-ammo-storage",
	"FARP CP Blindage": "image-farp-command-post",
	"FARP Fuel Depot": "image-farp-fuel-depot",
	"FARP Tent": "image-farp-tent",
	"Invisible FARP": "image-invisible-farp",
};

export function StructureBuilding(props: {
	building: DcsJs.CampaignStructureBuilding;
	coalition: DcsJs.CampaignCoalition;
}) {
	return (
		<div>
			<div class={Styles.header}>
				<h3 class={Styles["item-title"]}>{staticTypeName[props.building.type]}</h3>
			</div>
			<div class={Styles.building}>
				<div class={cnb(Styles["item-image"], Styles[staticTypeImage[props.building.type] ?? "image-garage-b"])} />
				<div class={Styles.stats}>
					<div>
						<p class={Styles["stat-label"]}>Status</p>
						<p class={Styles["stat-value"]}>{props.building.alive ? "Alive" : "Destroyed"}</p>
					</div>
					<Show when={props.building.repairScore != null}>
						<div>
							<p class={Styles["stat-label"]}>Repair</p>
							<p class={Styles["stat-value"]}>
								{Components.Utils.formatPercentage(((props.building.repairScore ?? 0) / repairScoreCost) * 100)}
							</p>
						</div>
					</Show>
				</div>
			</div>
		</div>
	);
}
