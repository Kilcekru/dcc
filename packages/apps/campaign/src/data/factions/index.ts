import type * as DcsJs from "@foxdelta2/dcsjs";

import * as france82 from "./france-1982.json";
import * as israel67 from "./israel-1967.json";
import * as russia55 from "./russia-1955.json";
import * as russia71 from "./russia-1971.json";
import * as russia84 from "./russia-1984.json";
import * as russia96 from "./russia-1996.json";
import * as sweden70 from "./sweden-1970.json";
import * as usnavy64 from "./us-navy-1964.json";
import * as usnavy87 from "./us-navy-1987.json";
import * as usa52 from "./usa-1952.json";
import * as usa77 from "./usa-1977.json";
import * as usa04 from "./usa-2004.json";

export const factionList: Array<DcsJs.Faction> = [
	usa52 as DcsJs.Faction,
	russia55 as DcsJs.Faction,
	usnavy64 as DcsJs.Faction,
	israel67 as DcsJs.Faction,
	sweden70 as DcsJs.Faction,
	russia71 as DcsJs.Faction,
	usa77 as DcsJs.Faction,
	france82 as DcsJs.Faction,
	russia84 as DcsJs.Faction,
	usnavy87 as DcsJs.Faction,
	russia96 as DcsJs.Faction,
	usa04 as DcsJs.Faction,
];
