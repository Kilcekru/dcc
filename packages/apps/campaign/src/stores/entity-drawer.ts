import { createStore } from "@kilcekru/dcc-lib-components";

export type EntityDrawerStore = {
	entityId: string | undefined;
};

export const entityDrawerStore = createStore<EntityDrawerStore>({
	entityId: undefined,
});
