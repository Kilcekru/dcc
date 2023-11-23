import * as DcsJs from "@foxdelta2/dcsjs";
import { addComponent, addEntity, createWorld, defineComponent, defineQuery, IWorld, Types } from "bitecs";

import * as Domain from "./domain";

const moves = 0;
export function loadBit(state: Partial<DcsJs.CampaignState>, loops: number) {
	const world = createWorld();

	state.blueFaction?.packages.forEach((pkg) => {
		flightPackage(world, state, "blue", pkg);
	});

	state.redFaction?.packages.forEach((pkg) => {
		flightPackage(world, state, "red", pkg);
	});

	Array.from({ length: 1000 }).forEach(() => {
		const eId = addEntity(world);

		addComponent(world, Task, eId);
		Task.task[eId] = TaskList.indexOf("DEAD");
	});

	const start = performance.now();
	Array.from({ length: loops }).forEach(() => {
		movementSystem(world);
	});
	const end = performance.now();

	// eslint-disable-next-line no-console
	console.log("bit", end - start, moves);
}

const AircraftTypeList = [
	"Tornado GR4",
	"Tornado IDS",
	"F/A-18A",
	"F/A-18C",
	"F-14A",
	"Tu-22M3",
	"F-4E",
	"B-52H",
	"MiG-27K",
	"Su-27",
	"MiG-23MLD",
	"Su-25",
	"Su-25TM",
	"Su-25T",
	"Su-33",
	"MiG-25PD",
	"MiG-25RBT",
	"Su-30",
	"Su-17M4",
	"MiG-31",
	"Tu-95MS",
	"Su-24M",
	"Su-24MR",
	"Tu-160",
	"F-117A",
	"B-1B",
	"S-3B",
	"S-3B Tanker",
	"Mirage 2000-5",
	"Mirage-F1CE",
	"Mirage-F1EE",
	"F-15C",
	"F-15E",
	"F-15ESE",
	"MiG-29A",
	"MiG-29G",
	"MiG-29S",
	"Tu-142",
	"C-130",
	"An-26B",
	"An-30M",
	"C-17A",
	"A-50",
	"E-3A",
	"IL-78M",
	"E-2C",
	"IL-76MD",
	"F-16C bl.50",
	"F-16C bl.52d",
	"F-16A",
	"F-16A MLU",
	"RQ-1A Predator",
	"Yak-40",
	"KC-135",
	"FW-190D9",
	"FW-190A8",
	"Bf-109K-4",
	"SpitfireLFMkIX",
	"SpitfireLFMkIXCW",
	"P-51D",
	"P-51D-30-NA",
	"P-47D-30",
	"P-47D-30bl1",
	"P-47D-40",
	"MosquitoFBMkVI",
	"Ju-88A4",
	"A-20G",
	"A-4E-C",
	"A-10A",
	"A-10C",
	"A-10C_2",
	"AJS37",
	"AV8BNA",
	"KC130",
	"KC135MPRS",
	"C-101EB",
	"C-101CC",
	"J-11A",
	"JF-17",
	"KJ-2000",
	"WingLoong-I",
	"H-6J",
	"Christen Eagle II",
	"F-16C_50",
	"F-5E",
	"F-5E-3",
	"F-86F Sabre",
	"F-14B",
	"F-14A-135-GR",
	"FA-18C_hornet",
	"Hawk",
	"I-16",
	"L-39C",
	"L-39ZA",
	"M-2000C",
	"MB-339A",
	"MB-339APAN",
	"MQ-9 Reaper",
	"MiG-15bis",
	"MiG-19P",
	"MiG-21Bis",
	"Su-34",
	"TF-51D",
	"Mi-24V",
	"Mi-8MT",
	"Mi-26",
	"Ka-27",
	"UH-60A",
	"UH-60L",
	"CH-53E",
	"CH-47D",
	"SH-3W",
	"AH-64A",
	"AH-64D",
	"AH-1W",
	"SH-60B",
	"UH-1H",
	"Mi-28N",
	"OH-58D",
	"AH-64D_BLK_II",
	"Ka-50",
	"Ka-50_3",
	"Mi-24P",
	"SA342M",
	"SA342L",
	"SA342Mistral",
	"SA342Minigun",
	"VSN_F4B",
	"VSN_F4C",
	"SK-60",
];

const TaskList = ["DEAD", "AWACS", "CAP", "Escort", "Pinpoint Strike", "CAS", "CSAR", "Air Assault"];

const CoalitionList = ["blue", "red"];
const Aircraft = defineComponent({
	aircraftType: Types.ui8,
});

const FlightGroup = defineComponent({
	aircrafts: [Types.eid, 4],
});

const Package = defineComponent({
	flightGroups: [Types.eid, 4],
});

const Task = defineComponent({
	task: Types.ui8,
});

const Position = defineComponent({
	x: Types.f32,
	y: Types.f32,
});

const Coalition = defineComponent({
	coalition: Types.ui8,
});

function flightPackage(
	world: IWorld,
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

			const unitId = addEntity(world);

			addComponent(world, Aircraft, unitId);
			Aircraft.aircraftType[unitId] = AircraftTypeList.indexOf(aircraft.aircraftType);

			unitIds.push(unitId);
		});

		const fgId = addEntity(world);
		addComponent(world, Task, fgId);
		addComponent(world, FlightGroup, fgId);
		addComponent(world, Position, fgId);
		addComponent(world, Coalition, fgId);

		Task.task[fgId] = TaskList.indexOf(flightGroup.task);
		FlightGroup.aircrafts[fgId]?.set(unitIds);
		Position.x[fgId] = flightGroup.position.x;
		Position.y[fgId] = flightGroup.position.y;
		Coalition.coalition[fgId] = CoalitionList.indexOf(coalition);

		fgIds.push(fgId);
	});

	const pkgId = addEntity(world);
	addComponent(world, Task, pkgId);
	addComponent(world, Package, pkgId);

	Task.task[pkgId] = TaskList.indexOf(pkg.task);
	Package.flightGroups[pkgId]?.set(fgIds);
}

const movementQuery = defineQuery([Position, FlightGroup, Coalition]);

const movementSystem = (world: IWorld) => {
	// apply system logic
	const ents = movementQuery(world);
	for (let i = 0; i < ents.length; i++) {
		const eid = ents[i];

		if (eid == null) {
			continue;
		}

		const coalition = Coalition.coalition[eid];

		const oppPosition = ents
			.filter((id) => Coalition.coalition[id] !== coalition)
			.map((id) => {
				return { x: Position.x[id] ?? 0, y: Position.y[id] ?? 0 };
			});

		const pos = { x: Position.x[eid] ?? 0, y: Position.y[eid] ?? 0 };

		const nearby = Domain.Location.findInside(oppPosition, pos, (p) => p, 100000);

		if (nearby.length > 0) {
			Position.x[eid] += 100;
			Position.y[eid] += 50;
		}
	}

	return world;
};
