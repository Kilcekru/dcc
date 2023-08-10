export const Config = {
	inventory: {
		aircraft: {
			cap: 8,
			cas: 4,
			awacs: 3,
			strike: 6,
			dead: 4,
		},
	},
	structureRange: {
		power: 50_000,
		ammo: 50_000,
		fuel: 50_000,
		hospital: 50_000,
		frontline: {
			barrack: 30_000,
			depot: 70_000,
			farp: 50_000,
		},
	},
	deploymentScore: {
		base: 12,
		penalty: {
			power: 0.3,
			ammo: 0.2,
			fuel: 0.2,
		},
		frontline: {
			barrack: 55_000,
			depot: 70_000,
			initialFactor: 0.75,
		},
		repair: 100_000,
		coalitionMultiplier: {
			blue: 1,
			red: 3.5,
		},
	},
	night: {
		startHour: 20,
		endHour: 6,
	},
	waypoint: {
		takeOff: 600,
	},
};
