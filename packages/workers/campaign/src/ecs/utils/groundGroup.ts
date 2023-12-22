import type * as DcsJs from "@foxdelta2/dcsjs";

import * as Entities from "../entities";
import { world } from "../world";

/**
 * Check if the ground group is already targeted by a another flight group or ground group
 * @param coalition - the coalition of the flight group
 * @param groundGroup - the ground group to check
 * @returns true if the ground group is already targeted by a another flight group or ground group
 */
export function groundGroupAlreadyTargeted(args: { coalition: DcsJs.Coalition; groundGroup: Entities.GroundGroup }) {
	const coalitionCASFgs = world.queries.flightGroups[args.coalition].get("CAS");

	for (const fg of coalitionCASFgs) {
		if (fg instanceof Entities.CasFlightGroup && fg.target === args.groundGroup) {
			return true;
		}
	}

	const coalitionAAFgs = world.queries.flightGroups[args.coalition].get("Air Assault");

	for (const fg of coalitionAAFgs) {
		if (fg instanceof Entities.AirAssaultFlightGroup && fg.target === args.groundGroup) {
			return true;
		}
	}

	return args.groundGroup.target.incomingGroundGroup != null;
}
