import type * as Types from "@kilcekru/dcc-shared-types";
import { createStore } from "@xstate/store";
import { produce } from "immer";

export type UserConfigStore = {
	config: Types.Core.UserConfig | undefined;
	error: Error | undefined;
};

export const userConfigStore = createStore({
	context: {
		config: undefined,
		error: undefined,
	} as UserConfigStore,
	on: {
		set: (context, { config }: { config: Types.Util.DeepReadonly<Types.Core.UserConfig> | undefined }) =>
			produce(context, (draft) => {
				draft.config = structuredClone(config) as Types.Core.UserConfig;
			}),
		setError: (context, { error }: { error: Error | undefined }) =>
			produce(context, (draft) => {
				draft.error = error;
			}),
	},
});
