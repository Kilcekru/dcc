import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createMemo, useContext } from "solid-js";

import { CampaignContext } from "./CampaignProvider";

export function useGetEntity() {
	const [state] = useContext(CampaignContext);
	return Utils.ECS.EntitySelector(state.entities);
}

export function useEntity<Type extends Types.Serialization.EntitySerialized>(id: Types.Campaign.Id | undefined) {
	const getEntity = useGetEntity();
	const entity = createMemo(() => {
		if (id == null) {
			return undefined;
		}

		return getEntity<Type>(id);
	});

	return entity;
}
