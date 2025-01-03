import * as Types from "@kilcekru/dcc-shared-types";
import { createMemo, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { Flag } from "./Flag";
import Styles from "./Item.module.less";

export function DownedPilot(props: { pilot: Types.Serialization.DownedPilotSerialized }) {
	const [state] = useContext(CampaignContext);
	const countryName = createMemo(() => {
		const coalition = props.pilot.coalition;
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
				<h2 class={Styles.title}>{props.pilot.name}</h2>
				<h3 class={Styles.subtitle}>Downed Pilot</h3>
			</div>
		</>
	);
}
