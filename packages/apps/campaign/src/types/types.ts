import { AircraftType } from "./aircraftType";

export type ObjectiveType = "Town" | "Terrain" | "Airport";
export type Position = {
	x: number;
	y: number;
};

export type MapPosition = [number, number];

export type Objective = {
	name: string;
	type: ObjectiveType;
	position: Position;
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

export type Aircraft = {
	chaff: number;
	display_name: string;
	flare: number;
	max_fuel: number;
	max_height: number;
	max_speed: number;
	name: AircraftType;
	loadouts: Array<Loadout>;
	availableTasks: Array<Task>;
	controllable: boolean;
	maxWaypoints?: number;
	isHelicopter: boolean;
	cruiseAltitude: number;
	cruiseSpeed: number;
	era: Era;
	carrierCapable: boolean;
};
