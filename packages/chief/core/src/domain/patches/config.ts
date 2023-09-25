import * as Types from "@kilcekru/dcc-shared-types";

interface PatchConfig {
	name: string;
	description: string;
	path: string;
	replace?: Array<{ search: string; substitute: string }>;
}

export const patches: Record<Types.Patch.Id, PatchConfig> = {
	scriptFileAccess: {
		name: "Script File-Access",
		description: "Allows DCS scripts to access the file-system",
		path: "Scripts\\MissionScripting.lua",
		replace: [
			{ search: "sanitizeModule('io')", substitute: "-- sanitizeModule('io')" },
			{ search: "sanitizeModule('lfs')", substitute: "-- sanitizeModule('lfs')" },
		],
	},
};
