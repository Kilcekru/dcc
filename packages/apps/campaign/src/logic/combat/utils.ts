import * as DcsJs from "@foxdelta2/dcsjs";

export const destroyAircraft = (faction: DcsJs.CampaignFaction, id: string, timer: number) => {
	const aircraft = faction.inventory.aircrafts[id];

	if (aircraft == null) {
		return;
	}

	aircraft.alive = false;
	aircraft.destroyedTime = timer;
};

export function getPackagesWithTarget(faction: DcsJs.CampaignFaction, target: string) {
	const pkgsWithTarget: Array<DcsJs.CampaignPackage> = [];

	faction.packages.forEach((pkg) => {
		const hasTargetFg = pkg.flightGroups.some((fg) => fg.target === target);

		if (hasTargetFg) {
			pkgsWithTarget.push(pkg);
		}
	});

	return pkgsWithTarget;
}
