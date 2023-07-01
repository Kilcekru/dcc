import type * as DcsJs from "@foxdelta2/dcsjs";

export type ObjectiveType = "Town" | "Terrain" | "Airport";

export type MapPosition = [number, number];

export type Objective = {
	name: string;
	type: ObjectiveType;
	position: DcsJs.Position;
};

export type Pylon = {
	CLSID: string;
	num?: number;
};
export type Payload = {
	chaff: number;
	flare: number;
	fuel: number;
	gun: number;
	pylons: Array<Pylon>;
};

export type Loadout = {
	task: Task | "default";
	name: string;
	displayName: string;
	pylons: Array<Pylon>;
};

export type Task =
	| "SEAD"
	| "DEAD"
	| "Intercept"
	| "Antiship Strike"
	| "AWACS"
	| "CAP"
	| "TARCAP"
	| "CAS"
	| "Escort"
	| "Intercept"
	| "Fighter Sweep"
	| "Ground Attack"
	| "Pinpoint Strike"
	| "Runway Attack"
	| "Transport"
	| "Refueling"
	| "RescueHelo"
	| "CSAR";

export type Era = "WW2" | "Korea" | "Early CW" | "Late CW" | "Modern";

export type StrikeTargetType = "Vehicle" | "AAA" | "Artillery" | "SAM" | "Structure";

export type UnitPosition = DcsJs.Position & {
	heading: number;
};
