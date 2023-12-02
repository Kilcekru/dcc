import { combatSystem } from "./combat";
import { movementSystem } from "./movement";
import { spawnSystem } from "./spawn";

export function frameTickSystems(worldDelta: number) {
	movementSystem(worldDelta, "blue");
	movementSystem(worldDelta, "red");
	combatSystem();
}

export function logicTickSystems() {
	// spawn groups
	spawnSystem("blue");
	spawnSystem("red");
}
