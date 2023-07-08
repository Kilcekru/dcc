import * as Types from "@kilcekru/dcc-shared-types";

import { campaign, home, misc } from "./handlers";
import * as Utils from "./utils";

export const rpc = {
	misc,
	campaign,
	home,
};

export function onEvent<Channel extends keyof Types.Events.Events>(
	channel: Channel,
	listener: (payload: Types.Events.Events[Channel]) => void,
) {
	const dispose = Utils.onEvent(channel, listener as (payload: unknown) => void);
	return { dispose };
}
