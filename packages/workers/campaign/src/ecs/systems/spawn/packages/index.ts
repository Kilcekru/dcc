import * as DcsJs from "@foxdelta2/dcsjs";

import { cap } from "./cap";
import { cas } from "./cas";
import { strike } from "./strike";

export function packages(coalition: DcsJs.Coalition) {
	cap(coalition);
	cas(coalition);
	strike(coalition);
}
