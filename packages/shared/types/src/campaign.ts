import type * as DcsJs from "@foxdelta2/dcsjs";
import { z } from "zod";

export type DataStore = {
	map: DcsJs.MapName;
	aircrafts: Partial<Record<DcsJs.AircraftType, DcsJs.DCS.Aircraft>> | undefined;
	groundUnitsTemplates: DcsJs.GetGroundUnitsTemplates | undefined;
	airdromes: DcsJs.GetMapData["airdromes"] | undefined;
	objectives: DcsJs.GetMapData["objectives"] | undefined;
	strikeTargets: DcsJs.GetMapData["strikeTargets"] | undefined;
	mapInfo: DcsJs.GetMapData["info"] | undefined;
	samTemplates: DcsJs.GetSamTemplates | undefined;
	vehicles: DcsJs.GetVehicles | undefined;
	structures: DcsJs.GetStructures | undefined;
	callSigns: DcsJs.GetCallSigns | undefined;
	launchers: DcsJs.GetLaunchers | undefined;
	weapons: DcsJs.GetWeapons | undefined;
	ships: DcsJs.GetShips | undefined;
};

export type MissionState = {
	killed_aircrafts: Array<string>;
	killed_ground_units: Array<string>;
	mission_ended: boolean;
	downed_pilots: Array<{
		name: string;
		coalition: number;
		time: number;
		x: number;
		y: number;
	}>;
	group_positions: Array<{
		name: string;
		x: number;
		y: number;
	}>;
	time: number;
	mission_id: string;
};

export namespace Schema {
	export const campaignSynopsis = z.object({
		id: z.string(),
		factionName: z.string().optional(),
		active: z.boolean(),
		name: z.string(),
		countryName: z.string().optional(),
		created: z.coerce.date(),
		edited: z.coerce.date(),
		timer: z.number(),
	});
}

export type CampaignSynopsis = z.infer<typeof Schema.campaignSynopsis>;

export interface BriefingDocument {
	package: DcsJs.FlightPackage;
	flightGroup: DcsJs.FlightGroup;
	faction: DcsJs.CampaignFaction;
	dataAircrafts: Partial<Record<DcsJs.AircraftType, DcsJs.DCS.Aircraft>>;
	mapData: DcsJs.MapData;
}
