import * as DcsJs from "@foxdelta2/dcsjs";

import { packages } from "./packages";

export function spawn(coalition: DcsJs.Coalition) {
	packages(coalition);
}
