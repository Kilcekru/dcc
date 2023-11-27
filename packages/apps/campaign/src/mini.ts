import * as DcsJs from "@foxdelta2/dcsjs";
import * as Miniplex from "miniplex";

import * as Domain from "./domain";

type Entity = {
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

export function loadMini(state: Partial<DcsJs.CampaignState>, loops: number) {
	const world = new Miniplex.World<Entity>();

	state.blueFaction?.packages.forEach((pkg) => {
		flightPackage(world, state, "blue", pkg);
	});

	state.redFaction?.packages.forEach((pkg) => {
		flightPackage(world, state, "red", pkg);
	});

	Array.from({ length: 1000 }).forEach(() => {
		world.add({
			Task: { task: "DEAD" },
		});
	});
	const start = performance.now();

	Array.from({ length: loops }).forEach(() => {
		MovementSystem(world, "blue");
		MovementSystem(world, "red");
	});

	const end = performance.now();

	// eslint-disable-next-line no-console
	console.log("mini", end - start);
}

function flightPackage(
	world: Miniplex.World<Entity>,
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

			const unitEntity = world.add({
				Aircraft: { aircraftType: aircraft.aircraftType as DcsJs.AircraftType },
				Coalition: coalition,
			});

			if (aircraft.maintenanceEndTime != null) {
				world.addComponent(unitEntity, "MaintenanceTime", { time: aircraft.maintenanceEndTime });
			}

			const unitId = world.id(unitEntity);

			if (unitId == null) {
				return;
			}

			unitIds.push(unitId);
		});

		const fgEntity = world.add({
			Task: { task: flightGroup.task },
			FlightGroup: { name: flightGroup.name, aircrafts: unitIds },
			Position: { x: flightGroup.position.x, y: flightGroup.position.y },
			Coalition: coalition,
		});

		if (coalition === "blue") {
			world.addComponent(fgEntity, "BlueCoalition", true);
		} else {
			world.addComponent(fgEntity, "RedCoalition", true);
		}
		const fgId = world.id(fgEntity);

		if (fgId == null) {
			return;
		}

		fgIds.push(fgId);
	});

	world.add({ Task: { task: pkg.task }, Package: { flightGroups: fgIds }, Coalition: coalition });
}

function MovementSystem(world: Miniplex.World<Entity>, coalition: DcsJs.Coalition) {
	const flightGroups = world.with("Position", "FlightGroup");
	const blueFgs = flightGroups.with("BlueCoalition");
	const redFgs = flightGroups.with("RedCoalition");

	const coalitionFgs = coalition === "blue" ? blueFgs.entities : redFgs.entities;
	const oppFgs = coalition === "blue" ? redFgs.entities : (blueFgs.entities as Array<Entity>);

	for (const fg of coalitionFgs) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const nearby = Domain.Location.findInside(oppFgs, fg.Position, (f) => f.Position!, 100000);

		if (nearby.length > 0) {
			fg.Position.x += 100;
			fg.Position.y += 50;
		}
	}
}
