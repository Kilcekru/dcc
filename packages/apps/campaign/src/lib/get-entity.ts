import * as Types from "@kilcekru/dcc-shared-types";

import { campaignStore } from "../stores/campaign";

export function getEntity<Type extends Types.Serialization.EntitySerialized>(id: string): Type {
	const e = campaignStore.get().context?.entities.get(id);
	if (e == undefined) {
		throw new Error(`getEntity: invalid id ${id}`);
	}
	return e as unknown as Type;
}
