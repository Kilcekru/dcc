import * as DcsJs from "@foxdelta2/dcsjs";

import { cap } from "./cap";
import { cas } from "./cas";

export function packages(coalition: DcsJs.Coalition) {
	cap(coalition);
	cas(coalition);
}
