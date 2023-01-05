import type { Campaign as DcsJsCampaign, GetAirdromes } from "@foxdelta2/dcsjs";
export interface Misc {
	getVersions: () => Promise<{ electron: string; node: string; chrome: string }>;
}

export type Faction = {
	cap: Array<string>;
	cas: Array<string>;
	awacs: Array<string>;
	vehicles: Array<string>;
	country: string;
	name: string;
};

export type CampaignUnitState = "idle" | "en route" | "on objective";
export type CampaignUnit = {
	id: string;
	name: string;
	displayName: string;
	category: string;
	alive: boolean;
	destroyedTime?: number;
	state: CampaignUnitState;
};

export type CampaignCoalition = "blue" | "red" | "neutral";

export type CampaignObjective = {
	name: string;
	position: { x: number; y: number };
	units: Array<CampaignUnit>;
	coalition: CampaignCoalition;
};

export type CampaignSam = {
	id: string;
	position: { x: number; y: number };
	units: Array<CampaignUnit>;
	range: number;
};

export type CampaignFaction = Faction & {
	airdromes: Array<string>;
	inventory: {
		aircrafts: Array<CampaignAircraft>;
		vehicles: Array<CampaignUnit>;
	};
	packages: Array<CampaignPackage>;
	sams: Array<CampaignSam>;
};

export type CampaignAircraftState = "idle" | "en route" | "on station" | "combat" | "rtb" | "maintenance";
export type CampaignAircraft = {
	id: string;
	aircraftType: string;
	state: CampaignAircraftState;
	maintenanceEndTime?: number;
	availableTasks: Array<string>;
	position: {
		x: number;
		y: number;
	};
	weaponReadyTimer?: number;
};

export type CampaignWaypoint = {
	name: string;
	time: number;
	endTime: number;
	speed: number;
	position: { x: number; y: number };
	endPosition: { x: number; y: number };
};

export type CampaignFlightGroup = {
	id: string;
	name: string;
	aircraftIds: Array<string>;
	task: string;
	waypoints: Array<CampaignWaypoint>;
	startTime: number;
	tot: number;
	landingTime: number;
	objective?: CampaignObjective;
};
export type CampaignPackage = {
	id: string;
	startTime: number;
	endTime: number;
	task: string;
	airdrome: string;
	flightGroups: Array<CampaignFlightGroup>;
};

export type CampaignState = {
	active: boolean;
	timer: number;
	multiplier: number;
	paused: boolean;
	blueFaction: CampaignFaction | undefined;
	redFaction: CampaignFaction | undefined;
	objectives: Array<CampaignObjective>;
};
export interface Campaign {
	getAirdromes: () => Promise<GetAirdromes>;
	generateCampaignMission: (campaign: DcsJsCampaign) => Promise<{ success: boolean }>;
	save: (campaign: CampaignState) => Promise<{ success: boolean }>;
	load: () => Promise<Partial<CampaignState>>;
}
