import type * as DcsJs from "@foxdelta2/dcsjs";
import { z } from "zod";

export type DataStore = {
	map: DcsJs.MapName;
	aircrafts: Partial<Record<DcsJs.AircraftType, DcsJs.DCS.Aircraft>> | undefined;
	groundUnitsTemplates: DcsJs.GetGroundUnitsTemplates | undefined;
	airdromes: DcsJs.GetMapData["airdromes"] | undefined;
	objectives: DcsJs.GetMapData["objectives"] | undefined;
	strikeTargets: DcsJs.GetMapData["strikeTargets"] | undefined;
	samTemplates: DcsJs.GetSamTemplates | undefined;
	vehicles: DcsJs.GetVehicles | undefined;
	structures: DcsJs.GetStructures | undefined;
	callSigns: DcsJs.GetCallSigns | undefined;
	launchers: DcsJs.GetLaunchers | undefined;
	weapons: DcsJs.GetWeapons | undefined;
};

export type MissionState = {
	killed_aircrafts: Array<string>;
	killed_ground_units: Array<string>;
	mission_ended: boolean;
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
	});
}

export type CampaignSynopsis = z.infer<typeof Schema.campaignSynopsis>;

export interface Campaign {
	getSamTemplates: () => Promise<DcsJs.GetSamTemplates>;
	getVehicles: () => Promise<DcsJs.GetVehicles>;
	getDataStore: (map: DcsJs.MapName) => Promise<DataStore>;
	generateCampaignMission: (campaign: DcsJs.CampaignState) => Promise<{ success: boolean }>;
	resumeCampaign: () => Promise<Partial<DcsJs.CampaignState> | undefined | null>;
	openCampaign: (id: string) => Promise<DcsJs.CampaignState | undefined | null>;
	loadCampaignList: () => Promise<Record<string, CampaignSynopsis>>;
	loadMissionState: () => Promise<MissionState | undefined>;
	loadFactions: () => Promise<Array<DcsJs.Faction>>;
	saveCustomFactions: (value: Array<DcsJs.Faction>) => Promise<void>;
	saveCampaign: (campaign: DcsJs.CampaignState) => Promise<void>;
	removeCampaign: (id: string) => Promise<void>;
}
