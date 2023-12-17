import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import * as Entities from "../entities";
import { world } from "../world";

export type AircraftBundle = {
	aircrafts: Set<Entities.Aircraft>;
	homeBase: Entities.HomeBase;
};

function getUsableAircraftsByTask(args: {
	coalition: DcsJs.Coalition;
	task: DcsJs.Task;
	excludedAircrafts?: Set<Entities.Aircraft>;
}): Set<Entities.Aircraft> {
	const desiredAircraftTypes = new Set(world.factionDefinitions[args.coalition]?.aircraftTypes[args.task]);

	const aircraftsPerAircraftType = new Map<DcsJs.AircraftType, Set<Entities.Aircraft>>();

	// Loop through all idle aircrafts
	for (const aircraft of world.queries.aircrafts[args.coalition].get("idle") ?? new Set()) {
		// Is the aircraft one of the desired types?
		if (desiredAircraftTypes.has(aircraft.aircraftType.name)) {
			// Is the aircraft not excluded?
			if (args.excludedAircrafts?.has(aircraft)) {
				continue;
			}

			// Map the aircraft to the aircraft type
			const prev = aircraftsPerAircraftType.get(aircraft.aircraftType.name);

			if (prev == null) {
				aircraftsPerAircraftType.set(aircraft.aircraftType.name, new Set([aircraft]));
			} else {
				prev.add(aircraft);
			}
		}
	}

	// Get the aircraft types with the minimum amount of aircrafts
	const aircraftTypeWithMinAmount: Array<DcsJs.AircraftType> = [];

	for (const [aircraftType, aircrafts] of aircraftsPerAircraftType) {
		if (aircrafts.size >= Utils.Config.packages[args.task].aircrafts) {
			aircraftTypeWithMinAmount.push(aircraftType);
		}
	}

	const selectedAircraftType = Utils.Random.item(aircraftTypeWithMinAmount);

	if (selectedAircraftType == null) {
		return new Set();
	}

	return aircraftsPerAircraftType.get(selectedAircraftType) ?? new Set();
}

type TaskProps =
	| {
			task: "CAP";
			target: Entities.HomeBase;
	  }
	| {
			task: "CAS";
	  };

/**
 *	Returns a set of aircrafts which are available for a task at one home base and the home base they are stationed at
 * @param args Coalition, the task of the desired aircrafts and optionally a set of excluded aircrafts
 * @returns Returns a set of aircrafts and the home base they are stationed at
 */
export function getAircraftBundle(
	args: {
		coalition: DcsJs.Coalition;
		excludedAircrafts?: Set<Entities.Aircraft>;
	} & TaskProps,
): AircraftBundle | undefined {
	const aircrafts = getUsableAircraftsByTask(args);

	// Map the aircrafts to their home bases
	const aircraftsPerHomeBase = new Map<Entities.HomeBase, Set<Entities.Aircraft>>();

	for (const aircraft of aircrafts) {
		const prev = aircraftsPerHomeBase.get(aircraft.homeBase);

		if (prev == null) {
			aircraftsPerHomeBase.set(aircraft.homeBase, new Set([aircraft]));
		} else {
			prev.add(aircraft);
		}
	}

	// Only allow home bases with at least the min count of aircrafts
	const homeBasesWithMinAmount: Array<Entities.HomeBase> = [];

	for (const [homeBase, aircrafts] of aircraftsPerHomeBase) {
		if (aircrafts.size >= Utils.Config.packages[args.task].aircrafts) {
			homeBasesWithMinAmount.push(homeBase);
		}
	}

	let selectedHomeBase: Entities.HomeBase | undefined;

	// Select one of the home bases
	switch (args.task) {
		case "CAP": {
			let distanceToHomeBase = 99999999;

			for (const homeBase of homeBasesWithMinAmount) {
				const distance = Utils.Location.distanceToPosition(homeBase.position, args.target.position);

				if (distance < distanceToHomeBase) {
					selectedHomeBase = homeBase;
					distanceToHomeBase = distance;
				}
			}
			break;
		}
		case "CAS": {
			const oppCoalition = Utils.Coalition.opposite(args.coalition);
			const oppGroundGroups = world.queries.groundGroups[oppCoalition].get("on target");
			let distanceToHomeBase = 99999999;

			for (const homeBase of homeBasesWithMinAmount) {
				for (const oppGroundGroup of oppGroundGroups) {
					const distance = Utils.Location.distanceToPosition(homeBase.position, oppGroundGroup.position);

					if (distance < distanceToHomeBase && distance <= Utils.Config.packages.CAS.maxDistance) {
						selectedHomeBase = homeBase;
						distanceToHomeBase = distance;
					}
				}
			}

			break;
		}
	}

	if (selectedHomeBase == null) {
		return;
	}

	// Get the aircrafts for the selected home base
	const aircraftsForSelectedHomeBase = aircraftsPerHomeBase.get(selectedHomeBase);

	if (aircraftsForSelectedHomeBase == null) {
		return;
	}

	// Get the first n(amount for this task) aircrafts
	const retValAircrafts = new Set<Entities.Aircraft>();

	for (const aircraft of aircraftsForSelectedHomeBase) {
		retValAircrafts.add(aircraft);

		if (retValAircrafts.size >= Utils.Config.packages[args.task].aircrafts) {
			break;
		}
	}

	return {
		homeBase: selectedHomeBase,
		aircrafts: retValAircrafts,
	};
}
