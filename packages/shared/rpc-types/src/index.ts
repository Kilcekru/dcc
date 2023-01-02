export interface Misc {
	getVersions: () => Promise<{ electron: string; node: string; chrome: string }>;
}

export type Faction = {
	aircrafts: Array<string>;
	awacs: Array<string>;
	country: string;
	name: string;
};

export type CampaignUnit = {
	id: string;
	name: string;
	displayName: string;
	category: string;
	alive: boolean;
	destroyedTime?: number;
};

export type CampaignCoalition = "blue" | "red" | "neutral";

export type CampaignObjective = {
	name: string;
	position: { x: number; y: number };
	units: Array<CampaignUnit>;
	coalition: CampaignCoalition;
};

export type FactionData = Faction & {
	airdromes: Array<string>;

	activeAircrafts: Array<CampaignAircraft>;
	packages: Array<CampaignPackage>;
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
	blueFaction: FactionData | undefined;
	redFaction: FactionData | undefined;
	objectives: Array<CampaignObjective>;
};
export interface Campaign {
	save: (campaign: CampaignState) => Promise<{ success: boolean }>;
	load: () => Promise<Partial<CampaignState>>;
}
