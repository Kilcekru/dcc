import type * as DcsJs from "@foxdelta2/dcsjs";

export function isCampaignStructureUnitCamp(
	structure: DcsJs.Structure | undefined
): structure is DcsJs.StructureUnitCamp {
	return (structure as DcsJs.StructureUnitCamp).deploymentScore != null;
}
