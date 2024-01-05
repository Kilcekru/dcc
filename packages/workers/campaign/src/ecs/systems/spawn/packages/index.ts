import * as DcsJs from "@foxdelta2/dcsjs";

import { cap } from "./cap";
import { cas } from "./cas";
import { dead } from "./dead";
import { strike } from "./strike";

export function packages(coalition: DcsJs.Coalition) {
	cap(coalition);
	cas(coalition);
	strike(coalition);

	if (coalition === "blue") {
		dead(coalition);
	}
}
