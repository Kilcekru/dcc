import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import { createMemo, For, useContext } from "solid-js";

import { CampaignContext, useGetEntity } from "../../../../components";
import { Flag } from "./Flag";
import { FlightGroupUnit } from "./FlightGroupUnit";
import Style from "./Item.module.less";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";

export function Airdrome(props: { airdrome: Types.Serialization.AirdromeSerialized }) {
	const [state] = useContext(CampaignContext);
	const getEntity = useGetEntity();
	const countryName = createMemo(() => {
		const coalition = props.airdrome.coalition;
		const faction = state.factionDefinitions[coalition];

		if (faction == null) {
			return undefined;
		}
		return faction.countryName;
	});

	const [overlayStore] = useContext(OverlaySidebarContext);

	return (
		<>
			<div>
				<Flag countryName={countryName()} />
				<h2 class={Style.title}>{overlayStore.name}</h2>
			</div>
			<Components.ScrollContainer>
				<Components.List>
					<For each={props.airdrome.aircraftIds}>
						{(id) => {
							const aircraft = getEntity<Types.Serialization.AircraftSerialized>(id);
							return (
								<Components.ListItem>
									<FlightGroupUnit aircraft={aircraft} />
								</Components.ListItem>
							);
						}}
					</For>
				</Components.List>
			</Components.ScrollContainer>
		</>
	);
}
