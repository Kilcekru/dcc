import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import { generateGroundGroupInventory } from "../createCampaign/generateGroundUnitsInventory";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction } from "../utils";

export function groundGroup({
	targetObjective,
	startObjective,
	groupType,
	state,
	dataStore,
	groupState,
	flightGroupId,
}: {
	targetObjective: DcsJs.Objective;
	startObjective: DcsJs.Objective;
	groupType: DcsJs.GroundGroupType;
	groupState: DcsJs.GroundGroup["state"];
	state: RunningCampaignState;
	dataStore: Types.Campaign.DataStore;
	flightGroupId?: string;
}) {
	const faction = getCoalitionFaction(startObjective.coalition, state);

	const { groundUnits, shoradGroundUnits } = generateGroundGroupInventory(faction, dataStore, groupType);

	const id = createUniqueId();

	const gg: DcsJs.GroundGroup = {
		id,
		name: targetObjective.name + "-" + id,
		startObjectiveName: startObjective.name,
		objectiveName: targetObjective.name,
		position: groupState === "on objective" ? targetObjective.position : startObjective.position,
		startTime: state.timer,
		state: groupState,
		unitIds: groundUnits.map((u) => u.id),
		shoradUnitIds: shoradGroundUnits.map((u) => u.id),
		type: groupType,
		flightGroupId,
	};

	// create ground group
	faction.groundGroups.push(gg);

	// update inventory
	[...groundUnits, ...shoradGroundUnits].forEach((u) => {
		faction.inventory.groundUnits[u.id] = {
			...u,
			state: groupState === "on objective" ? "on objective" : "en route",
		};
	});

	// update objective
	if (groupState !== "on objective") {
		targetObjective.incomingGroundGroups[startObjective.coalition] = id;
	}
}
