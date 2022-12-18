import { Rectangle } from "electron";

import { Persistance } from "./persistance";

export const appState = new Persistance<AppState>({ path: "app/state" });

interface AppState {
	win: {
		bounds?: Rectangle;
		maximized?: boolean;
	};
}
