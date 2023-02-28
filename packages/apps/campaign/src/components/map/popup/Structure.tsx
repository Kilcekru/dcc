import * as DcsJS from "@foxdelta2/dcsjs";
import { cnb } from "cnbuilder";
import { For } from "solid-js";

import styles from "./Structure.module.less";

const staticTypeName: Record<DcsJS.StaticType, string> = {
	"Garage B": "Garage",
	"Tech hangar A": "Hangar",
};

const staticTypeImage: Record<DcsJS.StaticType, keyof typeof styles> = {
	"Garage B": "image-garage-b",
	"Tech hangar A": "image-tech-hangar-a",
};

export function Structure(props: { structure: DcsJS.CampaignStructure }) {
	return (
		<div>
			<h2 class={cnb(styles.header, styles.objective)}>{props.structure.objectiveName}</h2>
			<h2 class={styles.header}>{props.structure.structureType}</h2>
			<div class={styles.buildings}>
				<For each={props.structure.buildings}>
					{(building) => {
						return (
							<div class={styles.building}>
								<div
									class={cnb(styles["building-image"], styles[staticTypeImage[building.type] ?? "image-garage-b"])}
								/>
								<p class={styles["building-name"]}>{staticTypeName[building.type] ?? "Garage"}</p>
							</div>
						);
					}}
				</For>
			</div>
		</div>
	);
}
