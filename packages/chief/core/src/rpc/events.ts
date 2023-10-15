import * as Types from "@kilcekru/dcc-shared-types";

import * as Domain from "../domain";

export function send<Channel extends keyof Types.Events.Events>(
	channel: Channel,
	payload: Types.Events.Events[Channel],
) {
	Domain.Window.mainView?.webContents.send(channel, JSON.stringify(payload));
}
