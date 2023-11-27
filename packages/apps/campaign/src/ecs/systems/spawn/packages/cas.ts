import * as DcsJs from "@foxdelta2/dcsjs";

import { world } from "../../../world";

export function cas(coalition: DcsJs.Coalition) {
	const pkg = world.createPackage({
		coalition: coalition,
		task: "CAS",
	});

	pkg.createFlightGroup({
		coalition: coalition,
		position: { x: 0, y: 0 },
		task: "CAS",
		waypoints: [],
	});
}
