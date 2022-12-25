import { Astar, Grid } from "fast-astar";

export const PathFinder = () => {
	const grid = new Grid({
		col: 11,
		row: 7,
	});

	const astar = new Astar(grid);
	const path = astar.search([2, 3], [8, 3]);

	console.log(path); // eslint-disable-line no-console
};
