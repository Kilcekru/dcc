import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import { createMemo, For, useContext } from "solid-js";

import { CampaignContext, useGetEntity } from "../../../../components";
import { Flag } from "./Flag";
import { GroundGroupUnit } from "./GroundGroupUnit";
import Styles from "./Item.module.less";

export function Sam(props: { sam: Types.Serialization.SAMSerialized }) {
	const [state] = useContext(CampaignContext);
	const getEntity = useGetEntity();

	const countryName = createMemo(() => {
		const coalition = props.sam.coalition;
		const faction = state.factionDefinitions[coalition];

		if (faction == null) {
			return undefined;
		}
		return faction.countryName;
	});

	return (
		<>
			<div>
				<Flag countryName={countryName()} />
				<h2 class={Styles.title}>{props.sam.name}</h2>
				<h3 class={Styles.subtitle}>{props.sam.type}</h3>
				<div class={Styles.stats}>
					<Components.Stat>
						<Components.StatLabel>Status</Components.StatLabel>
						<Components.StatValue>{props.sam.active ? "Active" : "Inactive"}</Components.StatValue>
					</Components.Stat>
				</div>
			</div>
			<Components.ScrollContainer>
				<Components.List>
					<For each={props.sam.unitIds}>
						{(unitId) => {
							const unit = getEntity<Types.Serialization.GroundUnitSerialized>(unitId);
							return <GroundGroupUnit unit={unit} />;
						}}
					</For>
				</Components.List>
			</Components.ScrollContainer>
		</>
	);
}
