import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { capture } from "../capture";

export async function generateBriefingKneeboards(campaign: Types.Campaign.UIState) {
	const documents: Types.Capture.Document[] = [];
	const getEntity = Utils.ECS.EntitySelector(campaign.entities);

	for (const entity of campaign.entities.values()) {
		if (entity.entityType !== "Package" || entity.coalition !== "blue") {
			continue;
		}

		for (const fgId of entity.flightGroupIds) {
			const fg = getEntity<Types.Serialization.FlightGroupSerialized>(fgId);
			if (fg == undefined) {
				continue;
			}

			let hasClient = false;

			for (const acId of fg.aircraftIds) {
				const ac = getEntity<Types.Serialization.AircraftSerialized>(acId);

				if (ac?.isClient) {
					hasClient = true;
					break;
				}
			}

			if (hasClient) {
				documents.push({
					type: "campaign.briefing",
					data: {
						package: entity,
						flightGroup: fg,
						theatre: campaign.theatre,
						entities: campaign.entities,
					},
				});
			}
		}
	}

	return capture(documents);
}
