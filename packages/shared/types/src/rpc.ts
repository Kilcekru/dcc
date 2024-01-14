import { CampaignSynopsis, Faction, MissionState, UIState, WorkerState } from "./campaign";
import { AppName, DcsPaths, SystemConfig, UserConfig, Versions } from "./core";
import * as Patch from "./patch";
import { DeepReadonly } from "./util";

export interface Misc {
	getVersions: () => Promise<Versions>;
	getUserConfig: () => Promise<DeepReadonly<UserConfig>>;
	getSystemConfig: () => Promise<SystemConfig>;
	loadApp: (name: AppName) => Promise<void>;
	openExternalLink: (url: string) => Promise<void>;
}

export interface Home {
	findDcsPaths: () => Promise<Partial<DcsPaths>>;
	findDcsSavedGamesPath: (installPath: string) => Promise<string | undefined>;
	setDcsPaths: (paths: DcsPaths) => Promise<void>;
	setDcsNotAvailable: () => Promise<void>;
	setSetupComplete: () => Promise<void>;
	showOpenFileDialog: (args: { title: string; defaultPath?: string }) => Promise<string | undefined>;
	validateDcsInstallPath: (path: string) => Promise<boolean>;
	validateDcsSavedGamesPath: (path: string) => Promise<boolean>;
	validateDirectoryPath: (path: string) => Promise<boolean>;
	setDownloadsPath: (path: string) => Promise<void>;
	createSupportZip: () => Promise<string | undefined>;
}

export interface Campaign {
	generateCampaignMission: (campaign: UIState) => Promise<{ success: boolean }>;
	resumeCampaign: (version: number) => Promise<WorkerState | undefined | null>;
	openCampaign: (id: string) => Promise<WorkerState | undefined | null>;
	loadCampaignList: () => Promise<Record<string, CampaignSynopsis>>;
	loadMissionState: () => Promise<MissionState | undefined>;
	loadFactions: () => Promise<Array<Faction>>;
	saveCustomFactions: (value: Array<Faction>) => Promise<void>;
	saveCampaign: (campaign: WorkerState) => Promise<void>;
	removeCampaign: (id: string) => Promise<void>;
}

export interface Patches {
	detectPatch: (id: Patch.Id) => Promise<boolean | null>;
	executePatches: (execs: Patch.Execution) => Promise<void>;
	getPatchMode: (id: Patch.Id) => Promise<Patch.Mode | null>;
	setPatchModes: (patches: Patch.SetMode) => Promise<void>;
}
