export interface Misc {
	getVersions: () => Promise<{ electron: string; node: string; chrome: string }>;
}

export type Faction = {
	aircrafts: Array<string>;
	country: string;
	name: string;
};

export type FactionData = Faction & {
	airdromes: Array<string>;
	objectives: Array<string>;
	activeAircrafts: Array<CampaignAircraft>;
	packages: Array<CampaignPackage>;
};

export type CampaignAircraft = {
	id: string;
	aircraftType: string;
	state: "idle" | "en route" | "on station" | "combat" | "maintenance";
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
	name: string;
	aircraftIds: Array<string>;
	task: string;
	waypoints: Array<CampaignWaypoint>;
	startTime: number;
	tot: number;
	landingTime: number;
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
};
export interface Campaign {
	save: (campaign: CampaignState) => Promise<{ success: boolean }>;
	load: () => Promise<Partial<CampaignState>>;
}
