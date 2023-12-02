import { world } from "./ecs";
// import { postEvent } from "./events";

// let lastFrameTickTime: number;
let frameTickInterval: number | undefined;
let logicTickInterval: number | undefined;
let multiplier = 1;

export function resumeTicker(args: { multiplier: number }) {
	multiplier = args.multiplier;

	if (frameTickInterval == null) {
		// lastFrameTickTime = Date.now();
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
	// const currentTickTime = Date.now();
	// const dt = currentTickTime - lastFrameTickTime;
	// lastFrameTickTime = currentTickTime;

	world.frameTick(16, multiplier);
}

function logicTick() {
	world.logicTick();
}
