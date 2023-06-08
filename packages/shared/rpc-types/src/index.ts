import type * as DcsJs from "@foxdelta2/dcsjs";

export * from "./events";
export * from "./home";
export * from "./misc";

export type DataStore = {
	aircrafts: Partial<Record<DcsJs.AircraftType, DcsJs.Aircraft>> | undefined;
	airdromes: DcsJs.GetAirdromes | undefined;
	objectives: DcsJs.GetObjectives | undefined;
	strikeTargets: DcsJs.GetStrikeTargets | undefined;
	samTemplates: DcsJs.GetSamTemplates | undefined;
	vehicles: DcsJs.GetVehicles | undefined;
	structures: DcsJs.GetStructures | undefined;
	callSigns: DcsJs.GetCallSigns | undefined;
	launchers: DcsJs.GetLaunchers | undefined;
	weapons: DcsJs.GetWeapons | undefined;
};

export type CampaignState = Omit<DcsJs.Campaign, "blueFaction" | "redFaction"> & {
	active: boolean;
	loaded: boolean;
	timer: number;
	multiplier: number;
	paused: boolean;
	selectedFlightGroup: DcsJs.CampaignFlightGroup | undefined;
	blueFaction: DcsJs.CampaignFaction | undefined;
	redFaction: DcsJs.CampaignFaction | undefined;
	winningCondition: { type: "ground units" } | { type: "objective"; value: string };
	nextDay: boolean;
};

export type MissionState = {
	killed_aircrafts: Array<string>;
	killed_ground_units: Array<string>;
	mission_ended: boolean;
	time: number;
};

export interface Campaign {
	getAirdromes: () => Promise<DcsJs.GetAirdromes>;
	getObjectives: () => Promise<DcsJs.GetObjectives>;
	getStrikeTargets: () => Promise<DcsJs.GetStrikeTargets>;
	getSamTemplates: () => Promise<DcsJs.GetSamTemplates>;
	getVehicles: () => Promise<DcsJs.GetVehicles>;
	getDataStore: () => Promise<DataStore>;
	generateCampaignMission: (campaign: DcsJs.Campaign) => Promise<{ success: boolean }>;
	save: (campaign: CampaignState) => Promise<{ success: boolean }>;
	load: () => Promise<Partial<CampaignState>>;
	loadMissionState: () => Promise<MissionState | undefined>;
}
