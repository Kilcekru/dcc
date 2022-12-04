export interface Misc {
	getVersions: () => Promise<{ electron: string; node: string; chrome: string }>;
}
