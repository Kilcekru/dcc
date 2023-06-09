import * as Path from "path";

import { userConfig } from "../../persistance";

export function getMissionPath(): string | undefined {
	if (userConfig.data.dcs?.available) {
		return Path.join(userConfig.data.dcs.paths.savedGames, "Missions/dcc_mission.miz");
	}

	if (userConfig.data.downloadsPath) {
		return Path.join(userConfig.data.downloadsPath, "dcc_mission.miz");
	}

	return undefined;
}

export function getMissionStatePath(): string | undefined {
	if (userConfig.data.dcs?.available) {
		return Path.join(userConfig.data.dcs.paths.savedGames, "Missions/dcc_state.json");
	}

	if (userConfig.data.downloadsPath) {
		return Path.join(userConfig.data.downloadsPath, "dcc_state.json");
	}

	return undefined;
}
