import * as DcsJs from "@foxdelta2/dcsjs";
import { createMemo, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { RunningCampaignState } from "../../../../logic/types";
import { getCoalitionFaction } from "../../../../logic/utils";
import Style from "./Item.module.less";

export function GroundGroupUnit(props: { unitId: string; coalition: DcsJs.CampaignCoalition }) {
	const [state] = useContext(CampaignContext);

	const unit = createMemo(() => {
		const faction = getCoalitionFaction(props.coalition, state as RunningCampaignState);

		const unit = faction.inventory.groundUnits[props.unitId];

		if (unit == null) {
			// eslint-disable-next-line no-console
			console.error("GroundGroupUnit", "ground unit not found", props.unitId);
			throw "ground unit not found";
		}

		return unit;
	});

	return (
		<div>
			<div class={Style.header}>
				<h3 class={Style.subtitle}>{unit().name}</h3>
			</div>
		</div>
	);
}
