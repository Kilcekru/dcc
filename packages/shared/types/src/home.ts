import { DcsPaths } from "./misc";

interface showOpenFileDialogArgs {
	title: string;
	defaultPath?: string;
}

export interface Home {
	findDcsPaths: () => Promise<Partial<DcsPaths>>;
	findDcsSavedGamesPath: (installPath: string) => Promise<string | undefined>;
	setDcsPaths: (paths: DcsPaths) => Promise<void>;
	setDcsNotAvailable: () => Promise<void>;
	setSetupComplete: () => Promise<void>;
	showOpenFileDialog: (args: showOpenFileDialogArgs) => Promise<string | undefined>;
	validateDcsInstallPath: (path: string) => Promise<boolean>;
	validateDcsSavedGamesPath: (path: string) => Promise<boolean>;
	validateDirectoryPath: (path: string) => Promise<boolean>;
	setDownloadsPath: (path: string) => Promise<void>;
	createSupportZip: () => Promise<string | undefined>;
}
