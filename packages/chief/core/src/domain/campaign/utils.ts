import * as Path from "path";

import * as Domain from "../../domain";

export function getMissionPath(): string | undefined {
	if (Domain.Persistance.State.userConfig.data.dcs.available) {
		return Path.join(Domain.Persistance.State.userConfig.data.dcs.paths.savedGames, "Missions/dcc_mission.miz");
	}

	return Path.join(Domain.Persistance.State.userConfig.data.downloadsPath, "dcc_mission.miz");
}

export function getMissionStatePath(): string | undefined {
	if (Domain.Persistance.State.userConfig.data.dcs.available) {
		return Path.join(Domain.Persistance.State.userConfig.data.dcs.paths.savedGames, "Missions/dcc_state.json");
	}

	return Path.join(Domain.Persistance.State.userConfig.data.downloadsPath, "dcc_state.json");
}
