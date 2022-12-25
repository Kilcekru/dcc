declare module "fast-astar" {
	class Grid {
		col: number;
		row: number;
		constructor({ col: number, row: number });
	}

	class Astar {
		constructor(grid: Grid);

		search(
			[number, number],
			[number, number],
			{ rightAngle: boolean, optimalResult: boolean }?
		): Array<[number, number]>;
	}
}
