import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { capture } from "../capture";

export async function generateBriefingKneeboards(campaign: DcsJs.CampaignState) {
	const documents: Types.Capture.Document[] = [];
	const faction = campaign.blueFaction;

	if (faction == null) {
		return;
	}

	faction.packages.forEach((pkg) => {
		pkg.flightGroups.forEach((fg) => {
			const hasClient = fg.units.some((u) => u.client);

			if (hasClient) {
				documents.push({
					type: "campaign.briefing",
					data: {
						package: pkg,
						flightGroup: fg,
						faction,
						dataAircrafts: DcsJs.getAircrafts(),
						mapData: DcsJs.getMapData(campaign.map),
					},
				});
			}
		});
	});

	return capture(documents);
}
