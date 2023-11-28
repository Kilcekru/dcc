import { world } from "./ecs";
import { postEvent } from "./events";

let lastTickTime: number;
let tickInterval: number | undefined;

export function resumeTicker() {
	if (tickInterval == undefined) {
		lastTickTime = Date.now();
		tickInterval = setInterval(tick, 500);
	}
}

export function pauseTicker() {
	if (tickInterval != undefined) {
		clearInterval(tickInterval);
		tickInterval = undefined;
	}
}

function tick() {
	const currentTickTime = Date.now();
	const dt = currentTickTime - lastTickTime;
	lastTickTime = currentTickTime;

	world.frameTick();
	postEvent({ name: "tick", dt });
}
