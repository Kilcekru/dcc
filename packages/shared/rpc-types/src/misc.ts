export interface Misc {
	getVersions: () => Promise<{ electron: string; node: string; chrome: string }>;
	getUserConfig: () => Promise<Partial<UserConfig>>;
	getSystemConfig: () => Promise<SystemConfig>;
	loadApp: (name: "home" | "campaign") => Promise<void>;
}

export interface SystemConfig {
	env: "dev" | "pro";
}

export interface UserConfig {
	setupComplete: boolean;
	dcs:
		| { available: false }
		| {
				available: true;
				paths: DcsPaths;
		  };
	downloadsPath: string;
	currentApp: "home" | "campaign";
}

export interface DcsPaths {
	install: string;
	savedGames: string;
}
