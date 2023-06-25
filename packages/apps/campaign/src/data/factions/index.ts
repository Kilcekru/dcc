import * as DcsJs from "@foxdelta2/dcsjs";

import * as france from "./france.json";
import * as russia from "./russia.json";
import * as russia75 from "./russia-1975.json";
import * as russiaAI from "./russia-ai.json";
import * as usNavy from "./us-navy.json";
import * as usNavy72 from "./us-navy-1972.json";
import * as usa from "./usa.json";

export const factionList: Array<DcsJs.FactionDefinition> = [russia, russiaAI, russia75, usa, usNavy, usNavy72, france];
