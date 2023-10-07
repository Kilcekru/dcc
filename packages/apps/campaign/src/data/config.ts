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
		strike: { blue: 4, red: 3, neutral: 0 },
		cas: { blue: 3, red: 2, neutral: 0 },
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
			barrack: 50_000,
			depot: 60_000,
			farp: 50_000,
		},
		generateRangeMultiplier: { blue: 0.6, red: 0.8, neutral: 0 },
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
			barrack: 60_000,
			depot: 50_000,
			initialFactor: { blue: 0.75, red: 0.1, neutral: 0 },
		},
		repair: 100_000,
		coalitionMultiplier: {
			blue: 0.75,
			red: 5,
		},
		maxEnRoutePerUnitCamp: 0.8,
		maxEnRoute: { blue: 6, red: 2, neutral: 0 },
	},
	waypoint: {
		takeOff: 600,
	},
	mapOrigin: {
		caucasus: {
			x: -37.17517531,
			y: 634800.6017,
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
	campaignVersion: 1,
};
