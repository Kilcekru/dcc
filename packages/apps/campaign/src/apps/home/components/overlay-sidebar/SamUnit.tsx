import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";

import Style from "./Item.module.less";

export function SamUnit(props: { unit: DcsJs.CampaignUnit }) {
	return (
		<div>
			<div class={Style.header}>
				<h3 class={Style["item-title"]}>{props.unit.name}</h3>
				<Components.Stat>
					<Components.StatLabel>Status</Components.StatLabel>
					<Components.StatValue>{props.unit.alive ? "Alive" : "Destroyed"}</Components.StatValue>
				</Components.Stat>
			</div>
		</div>
	);
}
