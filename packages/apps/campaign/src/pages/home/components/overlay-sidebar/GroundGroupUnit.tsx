import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";

import Style from "./Item.module.less";

export function GroundGroupUnit(props: { unit: Types.Serialization.GroundUnitSerialized }) {
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
