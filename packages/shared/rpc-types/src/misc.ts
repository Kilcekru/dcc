export interface Misc {
	getVersions: () => Promise<Versions>;
	getUserConfig: () => Promise<Partial<UserConfig>>;
	getSystemConfig: () => Promise<SystemConfig>;
	loadApp: (name: "home" | "campaign") => Promise<void>;
	openExternalLink: (url: string) => Promise<void>;
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

export interface Versions {
	os: string;
	app: string;
	electron: string;
	node: string;
	chrome: string;
}
