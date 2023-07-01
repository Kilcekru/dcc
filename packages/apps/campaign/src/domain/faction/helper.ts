import * as DcsJs from "@foxdelta2/dcsjs";
export function isCustomFaction(faction: DcsJs.Faction) {
	return faction.created != null;
}

export function isSamGroup(group: DcsJs.GroundGroup | DcsJs.SamGroup): group is DcsJs.SamGroup {
	return group.type === "sam";
}

export function isGroundGroup(group: DcsJs.GroundGroup | DcsJs.SamGroup): group is DcsJs.GroundGroup {
	return group.type !== "sam";
}

export function getSamGroups(faction: DcsJs.CampaignFaction): Array<DcsJs.SamGroup> {
	const sams: Array<DcsJs.SamGroup> = [];
	faction.groundGroups.forEach((gg) => {
		if (isSamGroup(gg)) {
			sams.push(gg);
		}
	});

	return sams;
}
