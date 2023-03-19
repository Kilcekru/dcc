import * as DcsJS from "@foxdelta2/dcsjs";
import { cnb } from "cnbuilder";
import { For } from "solid-js";

import styles from "./Structure.module.less";

const staticTypeName: Record<DcsJS.StaticType, string> = {
	"Garage B": "Garage",
	"Tech hangar A": "Hangar",
	"Electric power box": "Power Box",
	"Repair workshop": "Repair Workshop",
};

const staticTypeImage: Record<DcsJS.StaticType, keyof typeof styles> = {
	"Garage B": "image-garage-b",
	"Tech hangar A": "image-tech-hangar-a",
	"Electric power box": "image-electric-power-box",
	"Repair workshop": "image-repair-workshop",
};

export function Structure(props: {
	structure: DcsJS.CampaignStructure;
	deploymentScore?: number;
	unitsCount?: { alive: number; destroyed: number };
}) {
	return (
		<div>
			<h2 class={cnb(styles.header, styles.objective)}>{props.structure.objectiveName}</h2>
			<h2 class={styles.header}>{props.structure.structureType}</h2>
			{props.deploymentScore == null ? null : <p>{props.deploymentScore}</p>}
			{props.unitsCount == null ? null : (
				<p>
					{props.unitsCount.alive}({props.unitsCount.destroyed})
				</p>
			)}
			<div class={styles.buildings}>
				<For each={props.structure.buildings}>
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
							</div>
						);
					}}
				</For>
			</div>
		</div>
	);
}
