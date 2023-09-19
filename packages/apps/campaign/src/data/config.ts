export const Config = {
	inventory: {
		aircraft: {
			cap: 8,
			cas: 4,
			awacs: 3,
			strike: 6,
			dead: 4,
			csar: 2,
		},
	},
	packages: {
		awacs: 1,
		strike: 3,
		dead: 2,
		csar: 2,
	},
	structureRange: {
		power: 50_000,
		ammo: 50_000,
		fuel: 50_000,
		hospital: 50_000,
		airdrome: 10_000,
		frontline: {
			barrack: 30_000,
			depot: 70_000,
			farp: 50_000,
		},
	},
	maxDistance: {
		helicopter: 50_000,
		csar: 30_000,
		cas: 100_000,
		strike: 150_000,
		dead: 150_000,
		cap: 100_000,
		awacs: 300_000,
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
			red: 2,
		},
	},
	night: {
		startHour: 20,
		endHour: 6,
	},
	waypoint: {
		takeOff: 600,
	},
	mapOrigin: {
		caucasus: {
			x: 0,
			y: 0,
		},
		normandy: {
			x: 0,
			y: 0,
		},
		persianGulf: {
			x: 0,
			y: 0,
		},
		southAtlantic: {
			x: 0,
			y: 0,
		},
		syria: {
			x: -587.411551255995,
			y: -56132.3249950192,
		},
	},
};
