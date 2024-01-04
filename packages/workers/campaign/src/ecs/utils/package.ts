import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import * as Entities from "../entities";
import { HoldWaypointTemplate } from "../objects";
import { getEntity, store } from "../store";
import { getUsableAircraftsByTask } from "./aircraft";
import { nearestOppAirdrome } from "./location";

export type AircraftBundle = {
	task: DcsJs.Task;
	aircrafts: Set<Entities.Aircraft>;
	homeBase: Entities.HomeBase;
};

export type AircraftBundleTarget =
	| {
			task: "CAP";
			oppAirdromeId: Types.Campaign.Id;
	  }
	| {
			task: "CAS";
			targetGroundGroupId: Types.Campaign.Id;
	  }
	| {
			task: "Escort";
			targetAircraftBundle: AircraftBundle;
	  }
	| {
			task: "Pinpoint Strike";
			targetStructureId: Types.Campaign.Id;
	  }
	| {
			task: "Air Assault";
			targetGroundGroupId: Types.Campaign.Id;
	  };

export type AircraftBundleWithTarget = Omit<AircraftBundle, "task"> & AircraftBundleTarget;

type TaskProps =
	| {
			task: "CAP";
			target: Entities.HomeBase;
	  }
	| {
			task: "CAS" | "Pinpoint Strike";
	  }
	| {
			task: "Escort";
			targetAircraftBundle: AircraftBundle;
	  }
	| {
			task: "Air Assault";
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
		case "Pinpoint Strike":
		case "Air Assault":
		case "CAS": {
			const oppCoalition = Utils.Coalition.opposite(args.coalition);
			let targetSet: Set<Entities.MapEntity> = new Set();
			let maxDistance = 0;
			let distanceToHomeBase = 99999999;

			switch (args.task) {
				case "CAS": {
					targetSet = store.queries.groundGroups[oppCoalition].get("on target");
					maxDistance = Utils.Config.packages.CAS.maxDistance;
					break;
				}
				case "Pinpoint Strike": {
					targetSet = store.queries.structures[oppCoalition];
					maxDistance = Utils.Config.packages["Pinpoint Strike"].maxDistance;
					break;
				}
				case "Air Assault": {
					targetSet = store.queries.groundGroups[oppCoalition].get("on target");
					maxDistance = Utils.Config.packages["Air Assault"].maxDistance;
					break;
				}
			}

			for (const homeBase of homeBasesWithMinAmount) {
				for (const targetEntity of targetSet) {
					const distance = Utils.Location.distanceToPosition(homeBase.position, targetEntity.position);

					if (distance < distanceToHomeBase && distance <= maxDistance) {
						selectedHomeBase = homeBase;
						distanceToHomeBase = distance;
					}
				}
			}

			break;
		}
		case "Escort": {
			let distanceToHomeBase = 99999999;

			for (const homeBase of homeBasesWithMinAmount) {
				const distance = Utils.Location.distanceToPosition(
					homeBase.position,
					args.targetAircraftBundle.homeBase.position,
				);

				if (distance < distanceToHomeBase) {
					selectedHomeBase = homeBase;
					distanceToHomeBase = distance;
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
		task: args.task,
		homeBase: selectedHomeBase,
		aircrafts: retValAircrafts,
	};
}

function getAircraftBundleWithTarget(
	args: {
		coalition: DcsJs.Coalition;
		excludedAircrafts?: Set<Entities.Aircraft>;
	} & TaskProps,
): AircraftBundleWithTarget | undefined {
	switch (args.task) {
		case "CAP": {
			const bundle = getAircraftBundle(args);

			if (bundle == null) {
				return undefined;
			}

			const oppAirdrome = Entities.CapFlightGroup.getValidTarget({
				coalition: args.coalition,
				target: args.target,
			});

			if (oppAirdrome == null) {
				return undefined;
			}

			return {
				...bundle,
				task: "CAP",
				oppAirdromeId: oppAirdrome.id,
			};
		}
		case "CAS": {
			const bundle = getAircraftBundle(args);

			if (bundle == null) {
				// eslint-disable-next-line no-console
				console.log("aircraft bundle not found for CAS", args.coalition);
				return undefined;
			}

			const targetGroundGroup = Entities.CasFlightGroup.getValidTarget({
				coalition: args.coalition,
				homeBase: bundle.homeBase,
			});

			if (targetGroundGroup == null) {
				// eslint-disable-next-line no-console
				console.log("No target found for CAS", args.coalition);
				return undefined;
			}

			return {
				...bundle,
				task: "CAS",
				targetGroundGroupId: targetGroundGroup.id,
			};
		}
		case "Escort": {
			const bundle = getAircraftBundle(args);

			if (bundle == null) {
				return undefined;
			}

			return {
				...bundle,
				task: "Escort",
				targetAircraftBundle: args.targetAircraftBundle,
			};
		}
		case "Pinpoint Strike": {
			const bundle = getAircraftBundle(args);

			if (bundle == null) {
				// eslint-disable-next-line no-console
				console.log("aircraft bundle not found for Strike", args.coalition);
				return undefined;
			}

			const targetStructure = Entities.StrikeFlightGroup.getValidTarget({
				coalition: args.coalition,
				homeBase: bundle.homeBase,
			});

			if (targetStructure == null) {
				// eslint-disable-next-line no-console
				console.log("No target found for CAS", args.coalition);
				return undefined;
			}

			return {
				...bundle,
				task: "Pinpoint Strike",
				targetStructureId: targetStructure.id,
			};
		}
		case "Air Assault": {
			const bundle = getAircraftBundle(args);

			if (bundle == null) {
				// eslint-disable-next-line no-console
				console.log("aircraft bundle not found for Air Assault", args.coalition);
				return undefined;
			}

			const targetGroundGroup = Entities.CasFlightGroup.getValidTarget({
				coalition: args.coalition,
				homeBase: bundle.homeBase,
			});

			if (targetGroundGroup == null) {
				// eslint-disable-next-line no-console
				console.log("No target found for Air Assault", args.coalition);
				return undefined;
			}

			return {
				...bundle,
				task: "CAS",
				targetGroundGroupId: targetGroundGroup.id,
			};
		}
		default: {
			return;
		}
	}
}
/**
 *	Returns a set of aircrafts which are available for a task at one home base and the home base they are stationed at
 * @param args Coalition, the task of the desired aircrafts and optionally a set of excluded aircrafts
 * @returns Returns a set of aircrafts and the home base they are stationed at
 */

export function getValidAircraftBundles(
	args: {
		coalition: DcsJs.Coalition;
		excludedAircrafts?: Set<Entities.Aircraft>;
	} & TaskProps,
): Map<DcsJs.Task, AircraftBundleWithTarget> | undefined {
	const aircraftBundles: Map<DcsJs.Task, AircraftBundleWithTarget> = new Map();

	switch (args.task) {
		case "CAP": {
			const capBundle = getAircraftBundleWithTarget(args);

			if (capBundle == null) {
				return undefined;
			}

			aircraftBundles.set("CAP", capBundle);
			break;
		}
		case "CAS": {
			const casBundle = getAircraftBundleWithTarget(args);

			if (casBundle == null || casBundle.task !== "CAS") {
				return undefined;
			}

			const targetGroundGroup = getEntity<Entities.GroundGroup>(casBundle.targetGroundGroupId);

			const oppAirdrome = nearestOppAirdrome(args.coalition, targetGroundGroup.position);

			if (oppAirdrome != null) {
				if (
					Utils.Location.distanceToPosition(targetGroundGroup.position, oppAirdrome.position) <
					Utils.Config.defaults.casEscortRange
				) {
					const escortBundle = getAircraftBundleWithTarget({
						...args,
						task: "Escort",
						targetAircraftBundle: casBundle,
					});

					if (escortBundle == null) {
						// eslint-disable-next-line no-console
						console.log("No escort bundle found for CAS package", args);
						return undefined;
					}

					aircraftBundles.set("Escort", escortBundle);
				}
			}

			aircraftBundles.set("CAS", casBundle);

			break;
		}
		case "Pinpoint Strike": {
			const strikeBundle = getAircraftBundleWithTarget(args);

			if (strikeBundle == null || strikeBundle.task !== "Pinpoint Strike") {
				return undefined;
			}

			const targetStructure = getEntity<Entities.Structure>(strikeBundle.targetStructureId);

			const oppAirdrome = nearestOppAirdrome(args.coalition, targetStructure.position);

			if (oppAirdrome != null) {
				const escortBundle = getAircraftBundleWithTarget({
					...args,
					task: "Escort",
					targetAircraftBundle: strikeBundle,
				});

				if (escortBundle == null) {
					// eslint-disable-next-line no-console
					console.log("No escort bundle found for Strike package", args);
					return undefined;
				}

				aircraftBundles.set("Escort", escortBundle);
			}

			aircraftBundles.set("Pinpoint Strike", strikeBundle);

			break;
		}
		case "Air Assault": {
			const assaultBundle = getAircraftBundleWithTarget(args);

			if (assaultBundle == null || assaultBundle.task !== "Air Assault") {
				return undefined;
			}

			aircraftBundles.set("Air Assault", assaultBundle);

			break;
		}
	}

	return aircraftBundles;
}

export function calcHoldWaypoint(aircraftBundles: Map<DcsJs.Task, AircraftBundleWithTarget>, task: DcsJs.Task) {
	const homeBases = new Set<Entities.HomeBase>();

	for (const bundle of aircraftBundles.values()) {
		homeBases.add(bundle.homeBase);
	}

	const bundle = aircraftBundles.get(task);

	if (bundle == null) {
		throw new Error("Bundle is null");
	}

	let holdPosition: DcsJs.Position | undefined = undefined;

	// If there are multiple home bases, we use the midpoint of all home bases as the hold position
	if (homeBases.size > 1) {
		holdPosition = Utils.Location.midpoint(Array.from(homeBases).map((hb) => hb.position));
	} else {
		// If there is only one home base, we use the midpoint between the home base and the target as the hold position
		switch (bundle.task) {
			case "CAS": {
				const [aircraft] = bundle.aircrafts;

				// If the aircraft is a helicopter, we don't need a hold waypoint
				if (aircraft?.isHelicopter) {
					return undefined;
				}

				const target = getEntity<Entities.GroundGroup>(bundle.targetGroundGroupId);

				holdPosition = Utils.Location.midpointAtDistance(
					bundle.homeBase.position,
					target.position,
					Utils.Config.defaults.holdWaypointDistance,
				);

				break;
			}
			case "Pinpoint Strike": {
				const target = getEntity<Entities.Structure>(bundle.targetStructureId);

				holdPosition = Utils.Location.midpointAtDistance(
					bundle.homeBase.position,
					target.position,
					Utils.Config.defaults.holdWaypointDistance,
				);

				break;
			}
		}
	}

	if (holdPosition == null) {
		throw new Error("Hold position is null");
	}

	return HoldWaypointTemplate.create({
		position: holdPosition,
	});
}

export function calcStartTime(aircraftBundles: Map<DcsJs.Task, AircraftBundleWithTarget>) {
	let startTime = 0;

	for (const bundle of aircraftBundles) {
		if (bundle[1].homeBase.latestStartTime > startTime) {
			startTime = bundle[1].homeBase.latestStartTime;
		}
	}

	return Utils.DateTime.toFullMinutes(startTime + Utils.DateTime.Minutes(Utils.Random.number(5, 10)));
}

export function calcCruiseSpeed(aircraftBundles: Map<DcsJs.Task, AircraftBundleWithTarget>) {
	let speed = Utils.Config.defaults.cruiseSpeed;

	for (const aircraftBundle of aircraftBundles.values()) {
		const [aircraft] = aircraftBundle.aircrafts;

		if (aircraft?.aircraftData.cruiseSpeed != null && aircraft.aircraftData.cruiseSpeed < speed) {
			speed = aircraft.aircraftData.cruiseSpeed;
		}
	}

	return speed;
}
