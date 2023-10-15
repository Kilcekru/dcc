import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";

import { AircraftLabel } from "../../../../components/aircraft-label/AircraftLabel";
import Styles from "./Item.module.less";

export function Aircraft(props: { unit: DcsJs.Aircraft }) {
	return (
		<div>
			<div class={Styles.header}>
				<h3 class={Styles["item-title"]}>
					<AircraftLabel aircraftType={props.unit.aircraftType as DcsJs.AircraftType} />
				</h3>
				<div class={Styles.stats}>
					<Components.Stat>
						<Components.StatLabel>Board Number</Components.StatLabel>
						<Components.StatValue>{props.unit.onboardNumber}</Components.StatValue>
					</Components.Stat>
					<Components.Stat>
						<Components.StatLabel>Task</Components.StatLabel>
						<Components.StatValue>{props.unit.availableTasks[0]}</Components.StatValue>
					</Components.Stat>
					<Components.Stat>
						<Components.StatLabel>Status</Components.StatLabel>
						<Components.StatValue>{props.unit.alive ? props.unit.state : "Destroyed"}</Components.StatValue>
					</Components.Stat>
				</div>
			</div>
		</div>
	);
}
