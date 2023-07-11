import * as Types from "@kilcekru/dcc-shared-types";

import { mainWindow } from "../app/startup";

export function send<Channel extends keyof Types.Events.Events>(
	channel: Channel,
	payload: Types.Events.Events[Channel],
) {
	mainWindow?.webContents.send(channel, JSON.stringify(payload));
}
