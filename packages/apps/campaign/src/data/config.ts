export const Config = {
	structureRange: {
		power: 50_000,
		ammo: 50_000,
		fuel: 50_000,
		frontline: {
			barrack: 30_000,
			depot: 70_000,
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
			barrack: 25_000,
			depot: 30_000,
		},
		repair: 100_000,
	},
	flight: {
		speed: 170,
	},
};
