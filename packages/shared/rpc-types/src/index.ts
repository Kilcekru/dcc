import type * as DcsJs from "@foxdelta2/dcsjs";
export interface Misc {
	getVersions: () => Promise<{ electron: string; node: string; chrome: string }>;
}

export type Faction = {
	cap: Array<string>;
	cas: Array<string>;
	awacs: Array<string>;
	vehicles: Array<string>;
	countryName: string;
	name: string;
};

export type CampaignState = Omit<DcsJs.Campaign, "blueFaction" | "redFaction"> & {
	active: boolean;
	timer: number;
	multiplier: number;
	paused: boolean;
	blueFaction: DcsJs.CampaignFaction | undefined;
	redFaction: DcsJs.CampaignFaction | undefined;
};

export interface Campaign {
	getAirdromes: () => Promise<DcsJs.GetAirdromes>;
	generateCampaignMission: (campaign: DcsJs.Campaign) => Promise<{ success: boolean }>;
	save: (campaign: CampaignState) => Promise<{ success: boolean }>;
	load: () => Promise<Partial<CampaignState>>;
}
