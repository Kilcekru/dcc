import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createMemo, useContext } from "solid-js";

import { RunningCampaignState } from "../logic/types";
import { getCoalitionFaction } from "../logic/utils";
import { CampaignContext } from "./CampaignProvider";

export const useFaction = (coalition: DcsJs.Coalition | undefined) => {
	const [state] = useContext(CampaignContext);
	const faction = createMemo(() => {
		if (coalition == null) {
			return undefined;
		}
		return getCoalitionFaction(coalition, state as RunningCampaignState);
	});

	return faction;
};

export function useGetEntity() {
	const [state] = useContext(CampaignContext);
	return function getEntity<Type extends Types.Ecs.EntitySerialized>(id: Types.Campaign.Id): Type {
		const entity = state.entities.get(id);
		if (entity == undefined) {
			throw new Error(`getEntity: invalid id ${id}`);
		}
		return entity as unknown as Type;
	};
}
