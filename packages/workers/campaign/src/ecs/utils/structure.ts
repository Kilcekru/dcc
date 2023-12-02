import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

export function calcInitDeploymentScore(coalition: DcsJs.Coalition, structureType: DcsJs.StructureType) {
	const margin = Utils.Random.number(0.8, 1.2);

	switch (structureType) {
		case "Barrack": {
			return (
				(Utils.Config.deploymentScore.frontline.barrack /
					Utils.Config.deploymentScore.frontline.initialFactor[coalition]) *
				margin
			);
		}
		case "Depot": {
			return (
				(Utils.Config.deploymentScore.frontline.depot /
					Utils.Config.deploymentScore.frontline.initialFactor[coalition]) *
				margin
			);
		}
	}

	return 0;
}
