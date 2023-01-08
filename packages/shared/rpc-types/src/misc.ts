export interface Misc {
	getVersions: () => Promise<{ electron: string; node: string; chrome: string }>;
	getUserConfig: () => Promise<Partial<UserConfig>>;
}

export interface UserConfig {
	dcs:
		| { available: false }
		| {
				available: true;
				paths: DcsPaths;
		  };
}

export interface DcsPaths {
	install: string;
	savedGames: string;
}
