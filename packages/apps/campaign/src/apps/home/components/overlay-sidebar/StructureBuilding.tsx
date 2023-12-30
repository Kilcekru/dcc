import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import { cnb } from "cnbuilder";
import { Show } from "solid-js";

import Styles from "./Item.module.less";

const staticTypeName: Record<string, string> = {
	"Garage B": "Garage",
	"Tech hangar A": "Hangar",
	"Electric power box": "Power Box",
	"Repair workshop": "Repair Workshop",
	"FARP Ammo Dump Coating": "Ammo Storage",
	"FARP CP Blindage": "Command Post",
	"FARP Fuel Depot": "Fuel Depot",
	"FARP Tent": "Tent",
	"Invisible FARP": "Heliport",
	"Boiler-house A": "Boiler House",
	"Chemical tank A": "Fuel Tank",
	"Hangar B": "Hangar",
	"Military staff": "Office Building",
	"TV tower": "TV Tower",
	"Workshop A": "Workshop",
	"Subsidiary structure 2": "Subsidiary Structure",
	"Small werehouse 2": "Small Warehouse",
};

const staticTypeImage: Record<string, keyof typeof Styles> = {
	"Garage B": "image-garage-b",
	"Tech hangar A": "image-tech-hangar-a",
	"Electric power box": "image-electric-power-box",
	"Repair workshop": "image-repair-workshop",
	"FARP Ammo Dump Coating": "image-farp-ammo-storage",
	"FARP CP Blindage": "image-farp-command-post",
	"FARP Fuel Depot": "image-farp-fuel-depot",
	"FARP Tent": "image-farp-tent",
	"Invisible FARP": "image-invisible-farp",
	"Boiler-house A": "image-boiler-house-a",
	"Chemical tank A": "image-chemical-tank-a",
	"Hangar B": "image-hangar-b",
	"Military staff": "image-military-staff",
	"TV tower": "image-tv-tower",
	"Workshop A": "image-workshop-a",
	"Subsidiary structure 2": "image-subsidiary-structure-2",
	"Small werehouse 2": "image-small-werehouse-2",
};

export function StructureBuilding(props: { building: Types.Serialization.BuildingSerialized }) {
	return (
		<div>
			<div class={Styles.header}>
				<h3 class={Styles["item-title"]}>{staticTypeName[props.building.staticType]}</h3>
			</div>
			<div class={Styles.building}>
				<div
					class={cnb(Styles["item-image"], Styles[staticTypeImage[props.building.staticType] ?? "image-garage-b"])}
				/>
				<div class={Styles["building-stats"]}>
					<div>
						<p class={Styles["stat-label"]}>Status</p>
						<p class={Styles["stat-value"]}>{props.building.alive ? "Alive" : "Destroyed"}</p>
					</div>
					<Show when={props.building.repairScore != null}>
						<div>
							<p class={Styles["stat-label"]}>Repair</p>
							<p class={Styles["stat-value"]}>
								{Components.Utils.formatPercentage(
									((props.building.repairScore ?? 0) / props.building.repairCost) * 100,
								)}
							</p>
						</div>
					</Show>
				</div>
			</div>
		</div>
	);
}
