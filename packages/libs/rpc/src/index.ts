import { Events } from "@kilcekru/dcc-shared-rpc-types";

import { campaign, home, misc } from "./handlers";
import * as Utils from "./utils";

export const rpc = {
	misc,
	campaign,
	home,
};

export function onEvent<Channel extends keyof Events>(channel: Channel, listener: (payload: Events[Channel]) => void) {
	const dispose = Utils.onEvent(channel, listener as (payload: unknown) => void);
	return { dispose };
}
