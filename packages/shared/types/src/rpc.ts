import type * as DcsJs from "@foxdelta2/dcsjs";

import { CampaignSynopsis, DataStore, MissionState } from "./campaign";
import { AppName, DcsPaths, SystemConfig, UserConfig, Versions } from "./core";
import * as Patch from "./patch";

export interface Misc {
	getVersions: () => Promise<Versions>;
	getUserConfig: () => Promise<UserConfig>;
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
	getSamTemplates: () => Promise<DcsJs.GetSamTemplates>;
	getVehicles: () => Promise<DcsJs.GetVehicles>;
	getDataStore: (map: DcsJs.MapName) => Promise<DataStore>;
	generateCampaignMission: (campaign: DcsJs.CampaignState) => Promise<{ success: boolean }>;
	resumeCampaign: (version: number) => Promise<Partial<DcsJs.CampaignState> | undefined | null>;
	openCampaign: (id: string) => Promise<Partial<DcsJs.CampaignState> | undefined | null>;
	loadCampaignList: () => Promise<Record<string, CampaignSynopsis>>;
	loadMissionState: () => Promise<MissionState | undefined>;
	loadFactions: () => Promise<Array<DcsJs.Faction>>;
	saveCustomFactions: (value: Array<DcsJs.Faction>) => Promise<void>;
	saveCampaign: (campaign: DcsJs.CampaignState) => Promise<void>;
	removeCampaign: (id: string) => Promise<void>;
}

export interface Patches {
	detectPatch: (id: Patch.Id) => Promise<boolean | undefined>;
	executePatches: (execs: Patch.Execution[]) => Promise<void>;
	executePatchOnQuit: (id: Patch.Id, action: Patch.Action | "none") => Promise<void>;
}
