import { UserConfig } from "@kilcekru/dcc-shared-rpc-types";
import { Rectangle } from "electron";

import { Persistance } from "./persistance";

export const dccState = new Persistance<DccState>({ path: "dcc/state" });
export const userConfig = new Persistance<UserConfig>({ path: "dcc/userConfig" });

interface DccState {
	win: {
		bounds?: Rectangle;
		maximized?: boolean;
	};
}
