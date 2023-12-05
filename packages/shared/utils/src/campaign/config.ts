import type * as DcsJs from "@foxdelta2/dcsjs";

type PerTask<Value> = Record<DcsJs.Task, Value>;
type PerCoalition = Record<DcsJs.Coalition, number>;

type Config = {
	inventory: {
		aircraft: PerTask<number>;
	};
	packages: PerTask<{
		maxActive: PerCoalition;
		maxDistance: number;
		aircrafts: number;
	}>;
	structureRange: {
		power: number;
		ammo: number;
		fuel: number;
		hospital: number;
		airdrome: number;
		frontline: {
			barrack: number;
			depot: number;
			farp: number;
		};
		generateRangeMultiplier: PerCoalition;
	};
	deploymentScore: {
		base: number;
		penalty: {
			power: number;
			ammo: number;
			fuel: number;
		};
		frontline: {
			barrack: number;
			depot: number;
			initialFactor: PerCoalition;
		};
		repair: number;
		coalitionMultiplier: PerCoalition;
		maxEnRoutePerUnitCamp: number;
		maxEnRoute: PerCoalition;
	};
	waypoint: {
		takeOff: number;
	};
	mapOrigin: Record<DcsJs.MapName, DcsJs.Position>;
	defaults: {
		cruiseSpeed: number;
		a2aRangeMultiplier: number;
		a2aCooldownDuration: number;
		groundGroupSpeed: number;
		g2gRange: number;
	};
	campaignVersion: number;
};

export const Config: Config = {
	inventory: {
		aircraft: {
			CAP: 12,
			CAS: 4,
			AWACS: 3,
			"Pinpoint Strike": 8,
			DEAD: 4,
			CSAR: 2,
			Escort: 2,
			"Air Assault": 4,
		},
	},
	packages: {
		AWACS: { maxActive: { blue: 1, red: 1, neutrals: 1 }, maxDistance: 300_000, aircrafts: 1 },
		"Pinpoint Strike": { maxActive: { blue: 4, red: 3, neutrals: 0 }, maxDistance: 150_000, aircrafts: 2 },
		Escort: { maxActive: { blue: 4, red: 3, neutrals: 0 }, maxDistance: 150_000, aircrafts: 2 },
		CAS: { maxActive: { blue: 3, red: 2, neutrals: 0 }, maxDistance: 100_000, aircrafts: 2 },
		DEAD: { maxActive: { blue: 2, red: 1, neutrals: 0 }, maxDistance: 200_000, aircrafts: 2 },
		CSAR: { maxActive: { blue: 2, red: 2, neutrals: 1 }, maxDistance: 30_000, aircrafts: 1 },
		CAP: { maxActive: { blue: 1, red: 1, neutrals: 1 }, maxDistance: 100_000, aircrafts: 2 },
		"Air Assault": { maxActive: { blue: 1, red: 1, neutrals: 1 }, maxDistance: 40_000, aircrafts: 2 },
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
		generateRangeMultiplier: { blue: 0.6, red: 0.8, neutrals: 0 },
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
			initialFactor: { blue: 0.4, red: 0.1, neutrals: 0 },
		},
		repair: 100_000,
		coalitionMultiplier: {
			blue: 0.75,
			red: 5,
			neutrals: 0,
		},
		maxEnRoutePerUnitCamp: 1,
		maxEnRoute: { blue: 6, red: 2, neutrals: 0 },
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
	defaults: {
		cruiseSpeed: 200,
		a2aRangeMultiplier: 0.66,
		a2aCooldownDuration: 30_000,
		groundGroupSpeed: 6,
		g2gRange: 500,
	},
	campaignVersion: 1,
};
