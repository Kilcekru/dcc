import * as DcsJs from "@foxdelta2/dcsjs";

import * as FlightGroup from "./flightGroup";
import * as GroundGroup from "./groundGroup";

export function movementSystem(worldDelta: number, coalition: DcsJs.Coalition) {
	FlightGroup.takeOff(coalition);
	FlightGroup.land(coalition);
	FlightGroup.move(worldDelta, coalition);
	GroundGroup.move(worldDelta, coalition);
}
