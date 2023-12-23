import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";

import type { Objective } from "../entities";
import { GenericStructure, UnitCamp } from "../entities";

export function generateStructures(args: {
	coalition: DcsJs.Coalition;
	objectivePlans: Array<Types.Campaign.ObjectivePlan>;
	dataStore: Types.Campaign.DataStore;
	objectives: Map<string, Objective>;
}) {
	const strikeTargets = args.dataStore.strikeTargets;

	if (strikeTargets == null) {
		throw new Error("strikeTargets not found");
	}

	for (const plan of args.objectivePlans) {
		for (const structurePlan of plan.structures) {
			const strikeTarget = strikeTargets[plan.objectiveName]?.find((st) => st.name === structurePlan.structureName);

			if (strikeTarget == null) {
				// eslint-disable-next-line no-console
				console.warn("strikeTarget not found", {
					objectiveName: plan.objectiveName,
					structureName: structurePlan.structureName,
				});
				continue;
			}

			const structureType = structurePlan.structureType as DcsJs.StructureType;

			const objective = args.objectives.get(plan.objectiveName);

			if (objective == null) {
				// eslint-disable-next-line no-console
				console.warn("objective not found", { objectiveName: plan.objectiveName });
				continue;
			}

			if (structureType === "Barrack" || structureType === "Depot") {
				new UnitCamp({
					name: structurePlan.structureName,
					objective,
					position: strikeTarget.position,
					structureType,
					coalition: args.coalition,
				});
			} else {
				GenericStructure.create({
					name: structurePlan.structureName,
					objective,
					position: strikeTarget.position,
					structureType,
					coalition: args.coalition,
				});
			}
		}
	}
}
