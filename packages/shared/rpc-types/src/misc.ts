export interface Misc {
	getVersions: () => Promise<{ electron: string; node: string; chrome: string }>;
	getUserConfig: () => Promise<Partial<UserConfig>>;
	loadApp: (name: "campaign" | "launcher") => Promise<void>;
}

export interface UserConfig {
	setupComplete: boolean;
	dcs:
		| { available: false }
		| {
				available: true;
				paths: DcsPaths;
		  };
	currentApp: "launcher" | "campaign";
}

export interface DcsPaths {
	install: string;
	savedGames: string;
}
