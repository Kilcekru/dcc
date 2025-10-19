import { createStore } from "@xstate/store";
import { produce } from "immer";

import { RoutePath } from "../router";

export type Route = {
	path: RoutePath;
	params: Record<string, string | number | undefined>;
};
export type RouterStore = {
	current: Route | null;
	history: Route[];
};

export const routerStore = createStore({
	context: {
		current: null,
		history: [],
	} as RouterStore,
	on: {
		push: (context, { path, params }: { path: RoutePath; params?: Record<string, string | number | undefined> }) =>
			produce(context, (draft) => {
				if (draft.current != null) {
					draft.history.push(draft.current);
				}
				draft.current = { path, params: params ?? {} };
			}),
		back: (context) =>
			produce(context, (draft) => {
				draft.current = draft.history.pop() ?? null;
			}),
	},
});
