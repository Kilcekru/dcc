import { UserConfig } from "@kilcekru/dcc-shared-rpc-types";
import { app } from "electron";

import { Persistance } from "./persistance";

export const userConfig = new Persistance<UserConfig>({
	path: "dcc/userConfig",
	default: { downloadsPath: app.getPath("downloads") },
});
