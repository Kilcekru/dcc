import { world } from "./ecs";
// import { postEvent } from "./events";

let lastFrameTickTime: number;
let frameTickInterval: number | undefined;
let logicTickInterval: number | undefined;

export function resumeTicker() {
	if (frameTickInterval == null) {
		lastFrameTickTime = Date.now();
		frameTickInterval = setInterval(tick, 16);
	}

	if (logicTickInterval == null) {
		logicTickInterval = setInterval(logicTick, 1000);
	}
}

export function pauseTicker() {
	if (frameTickInterval != null) {
		clearInterval(frameTickInterval);
		frameTickInterval = undefined;
	}

	if (logicTickInterval != null) {
		clearInterval(logicTickInterval);
		logicTickInterval = undefined;
	}
}

function tick() {
	const currentTickTime = Date.now();
	const dt = currentTickTime - lastFrameTickTime;
	lastFrameTickTime = currentTickTime;

	world.frameTick(dt);
}

function logicTick() {
	world.logicTick();
}
