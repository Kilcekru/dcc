import { combatSystem } from "./combat";
import { debugTick } from "./debug";
import { movementSystem } from "./movement";
import { spawnSystem } from "./spawn";
import { updateWeather } from "./weather";

export function frameTickSystems(worldDelta: number) {
	movementSystem(worldDelta, "blue");
	movementSystem(worldDelta, "red");
	combatSystem();
}

export function logicTickSystems() {
	// spawn groups
	spawnSystem("blue");
	spawnSystem("red");

	updateWeather();

	debugTick("blue");
}

