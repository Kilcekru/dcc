import { createStore } from "@kilcekru/dcc-lib-components";
import type * as Types from "@kilcekru/dcc-shared-types";

export type UserConfigStore = {
	config: Types.Util.DeepReadonly<Types.Core.UserConfig> | undefined;
	error: Error | undefined;
};

export const userConfigStore = createStore<UserConfigStore>({
	config: undefined,
	error: undefined,
});
