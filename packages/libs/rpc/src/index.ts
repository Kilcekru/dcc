import { Events } from "@kilcekru/dcc-shared-rpc-types";

import { campaign, launcher, misc } from "./handlers";
import * as Utils from "./utils";

export const rpc = {
	misc,
	campaign,
	launcher,
};

export function onEvent<Channel extends keyof Events>(channel: Channel, listener: (payload: Events[Channel]) => void) {
	const dispose = Utils.onEvent(channel, listener as (payload: unknown) => void);
	return { dispose };
}
