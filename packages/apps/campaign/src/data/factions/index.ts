import type * as DcsJs from "@foxdelta2/dcsjs";

import * as france82 from "./france-1982.json";
import * as russia71 from "./russia-1971.json";
import * as russia84 from "./russia-1984.json";
import * as russia96 from "./russia-1996.json";
import * as usnavy64 from "./us-navy-1964.json";
import * as usnavy87 from "./us-navy-1987.json";
import * as usa77 from "./usa-1977.json";
import * as usa04 from "./usa-2004.json";

export const factionList: Array<DcsJs.Faction> = [
	usnavy64,
	russia71,
	usa77,
	france82,
	russia84,
	usnavy87,
	russia96,
	usa04,
];
