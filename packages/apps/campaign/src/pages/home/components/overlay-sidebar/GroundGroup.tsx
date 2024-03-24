import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import { createMemo, For, Show, useContext } from "solid-js";

import { CampaignContext, useGetEntity } from "../../../../components";
import { Flag } from "./Flag";
import { GroundGroupUnit } from "./GroundGroupUnit";
import Styles from "./Item.module.less";

export function GroundGroup(props: { groundGroup: Types.Serialization.GroundGroupSerialized }) {
	const [state] = useContext(CampaignContext);
	const getEntity = useGetEntity();

	const objective = createMemo(() => {
		return getEntity<Types.Serialization.ObjectiveSerialized>(props.groundGroup.targetId);
	});

	const countryName = createMemo(() => {
		const coalition = props.groundGroup.coalition;
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
				<h2 class={Styles.title}>{objective().name}</h2>
			</div>
			<Components.ScrollContainer>
				<Components.List>
					<For each={props.groundGroup?.unitIds}>
						{(unitId) => {
							const unit = getEntity<Types.Serialization.GroundUnitSerialized>(unitId);
							return <GroundGroupUnit unit={unit} />;
						}}
					</For>
					<Show when={(props.groundGroup.shoradUnitIds.length ?? 0) > 0}>
						<h3 class={Styles.category}>Anti Air</h3>
						<For each={props.groundGroup?.shoradUnitIds}>
							{(unitId) => {
								const unit = getEntity<Types.Serialization.GroundUnitSerialized>(unitId);
								return <GroundGroupUnit unit={unit} />;
							}}
						</For>
					</Show>
				</Components.List>
			</Components.ScrollContainer>
		</>
	);
}
