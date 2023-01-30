import type * as DcsJs from "@foxdelta2/dcsjs";

import { DcsPaths } from "./misc";

export * from "./misc";

export interface Launcher {
	findDcsPaths: () => Promise<Partial<DcsPaths>>;
	findDcsSavedGamesPath: (installPath: string) => Promise<string | undefined>;
	validateDcsInstallPath: (path: string) => Promise<boolean>;
	validateDcsSavedGamesPath: (path: string) => Promise<boolean>;
	setDcsPaths: (paths: DcsPaths) => Promise<void>;
	setDcsNotAvailable: () => Promise<void>;
}

export type Faction = {
	aircraftTypes: {
		cap: Array<string>;
		cas: Array<string>;
		awacs: Array<string>;
		dead: Array<string>;
		strike: Array<string>;
		lightAttack: Array<string>;
		heliHunt: Array<string>;
	};
	vehicles: Array<string>;
	infantries: Array<string>;
	countryName: string;
	name: string;
	template: {
		sams: Array<string>;
	};
};

export type DataStore = {
	airdromes: DcsJs.GetAirdromes | undefined;
	objectives: DcsJs.GetObjectives | undefined;
	strikeTargets: DcsJs.GetStrikeTargets | undefined;
	samTemplates: DcsJs.getSamTemplates | undefined;
	vehicles: DcsJs.GetVehicles | undefined;
};

export type CampaignState = Omit<DcsJs.Campaign, "blueFaction" | "redFaction"> & {
	active: boolean;
	timer: number;
	multiplier: number;
	paused: boolean;
	selectedFlightGroup: DcsJs.CampaignFlightGroup | undefined;
	blueFaction: DcsJs.CampaignFaction | undefined;
	redFaction: DcsJs.CampaignFaction | undefined;
};

export interface Campaign {
	getAirdromes: () => Promise<DcsJs.GetAirdromes>;
	getObjectives: () => Promise<DcsJs.GetObjectives>;
	getStrikeTargets: () => Promise<DcsJs.GetStrikeTargets>;
	getSamTemplates: () => Promise<DcsJs.getSamTemplates>;
	getVehicles: () => Promise<DcsJs.GetVehicles>;
	getDataStore: () => Promise<DataStore>;
	generateCampaignMission: (campaign: DcsJs.Campaign) => Promise<{ success: boolean }>;
	save: (campaign: CampaignState) => Promise<{ success: boolean }>;
	load: () => Promise<Partial<CampaignState>>;
}
