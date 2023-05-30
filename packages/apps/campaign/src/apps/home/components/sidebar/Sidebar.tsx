import * as Components from "@kilcekru/dcc-lib-components";
import { For, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { getFlightGroups, sortDesc } from "../../../../utils";
import { FlightGroupItem } from "./FlightGroupItem";
import Styles from "./Sidebar.module.less";

export const Sidebar = () => {
	const [state] = useContext(CampaignContext);

	return (
		<div class={Styles.sidebar}>
			<h3 class={Styles.sidebar__title}>Flight Groups</h3>
			<Components.ScrollContainer>
				<Components.List class={Styles.sidebar__list}>
					<For
						each={getFlightGroups(state.blueFaction?.packages ?? []).sort((a, b) => sortDesc(a, b, (o) => o.startTime))}
					>
						{(fg) => <FlightGroupItem flightGroup={fg} faction={state.blueFaction} />}
					</For>
				</Components.List>
			</Components.ScrollContainer>
		</div>
	);
};
