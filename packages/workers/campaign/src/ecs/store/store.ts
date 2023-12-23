import * as Types from "@kilcekru/dcc-shared-types";

import type * as Entities from "../entities";

export let store: Store = initializeStore();

export function reset() {
	store = initializeStore();
}

function initializeStore(): Store {
	return {
		entities: new Map(),
	};
}

interface Store {
	entities: Map<Types.Campaign.Id, Entities.Entity>;
}
