import * as DcsJs from "@foxdelta2/dcsjs";

import * as Domain from "./domain";

type Entity = {
	id: number;
	Coalition?: DcsJs.Coalition;
	BlueCoalition?: true;
	RedCoalition?: true;
	Package?: {
		flightGroups: Array<number>;
	};
	FlightGroup?: {
		name: string;
		aircrafts: Array<number>;
	};
	Position?: {
		x: number;
		y: number;
	};
	Task?: {
		task: DcsJs.Task;
	};
	Aircraft?: {
		aircraftType: DcsJs.AircraftType;
	};
	Destroyed?: {
		time: number;
	};
	MaintenanceTime?: {
		time: number;
	};
};

export function loadArray(state: Partial<DcsJs.CampaignState>, loops: number) {
	const world: Array<Entity> = [];

	state.blueFaction?.packages.forEach((pkg) => {
		flightPackage(world, state, "blue", pkg);
	});

	state.redFaction?.packages.forEach((pkg) => {
		flightPackage(world, state, "red", pkg);
	});

	Array.from({ length: 1000 }).forEach(() => {
		world.push({
			id: world.length,
			Task: { task: "DEAD" },
		});
	});

	const start = performance.now();

	Array.from({ length: loops }).forEach(() => {
		MovementSystemFilter(world, "blue");
		MovementSystemFilter(world, "red");
	});

	const end = performance.now();

	// eslint-disable-next-line no-console
	console.log("array", end - start);
}

function flightPackage(
	world: Array<Entity>,
	state: Partial<DcsJs.CampaignState>,
	coalition: DcsJs.Coalition,
	pkg: DcsJs.FlightPackage,
) {
	const fgIds: Array<number> = [];

	pkg.flightGroups.forEach((flightGroup) => {
		const unitIds: Array<number> = [];
		flightGroup.units.forEach((unit) => {
			const aircraft = (coalition === "blue" ? state.blueFaction : state.redFaction)?.inventory.aircrafts[unit.id];

			if (aircraft == null) {
				return;
			}

			const unitId = world.length;

			world.push({
				id: unitId,
				Aircraft: { aircraftType: aircraft.aircraftType as DcsJs.AircraftType },
				Coalition: coalition,
			});

			unitIds.push(unitId);
		});

		const fgId = world.length;
		world.push({
			id: fgId,
			Task: { task: flightGroup.task },
			FlightGroup: { name: flightGroup.name, aircrafts: unitIds },
			Position: { x: flightGroup.position.x, y: flightGroup.position.y },
			Coalition: coalition,
		});

		fgIds.push(fgId);
	});

	const pkgId = world.length;
	world.push({ id: pkgId, Task: { task: pkg.task }, Package: { flightGroups: fgIds }, Coalition: coalition });
}

function MovementSystemFilter(world: Array<Entity>, coalition: DcsJs.Coalition) {
	const flightGroups = world.filter((e) => e.FlightGroup != null && e.Position != null);
	const blueFgs = flightGroups.filter((e) => e.Coalition === "blue");
	const redFgs = flightGroups.filter((e) => e.Coalition === "red");

	const coalitionFgs = coalition === "blue" ? blueFgs : redFgs;
	const oppFgs = coalition === "blue" ? redFgs : blueFgs;

	coalitionFgs;
	for (const fg of coalitionFgs) {
		if (fg.Position == null) {
			continue;
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const nearby = Domain.Location.findInside(oppFgs, fg.Position, (f) => f.Position!, 100000);

		if (nearby.length > 0) {
			fg.Position.x += 100;
			fg.Position.y += 50;
		}
	}
}
