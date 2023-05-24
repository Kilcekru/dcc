import { Events } from "@kilcekru/dcc-shared-rpc-types";

import { mainWindow } from "../app/startup";

export function send<Channel extends keyof Events>(channel: Channel, payload: Events[Channel]) {
	mainWindow?.webContents.send(channel, JSON.stringify(payload));
}
