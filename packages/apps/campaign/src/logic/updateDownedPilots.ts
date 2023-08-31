import type * as DcsJs from "@foxdelta2/dcsjs";

import * as Domain from "../domain";
import { Minutes } from "../utils";

export function updateDownedPilots(faction: DcsJs.CampaignFaction, timer: number) {
	faction.downedPilots = faction.downedPilots.filter((pilot) => {
		const withinTimeLimit = pilot.time + Minutes(60) >= timer;

		if (withinTimeLimit) {
			return true;
		}

		const csarPackages = faction.packages.filter((pkg) => pkg.task === "CSAR");
		const csarForPilot = csarPackages.find((pkg) => pkg.flightGroups.some((fg) => fg.target === pilot.id));
		const csarFg = csarForPilot?.flightGroups.find((fg) => fg.task === "CSAR");

		if (csarFg == null) {
			return false;
		}

		return Domain.Location.distanceToPosition(pilot.position, csarFg.position) < 100;
	});

	return faction;
}
