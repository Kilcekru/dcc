import React from "react";

import { CustomFaction } from "./routes/create/custom-faction";
import { Faction } from "./routes/create/faction";
import { Scenario } from "./routes/create/scenario";
import { Home } from "./routes/home";
import { Open } from "./routes/open";

const routePaths = [
	"error",
	"open",
	"create",
	"create/faction",
	"create/opponent-faction",
	"create/custom-faction",
	"home",
] as const;
export type RoutePath = (typeof routePaths)[number];

export const routerRecord: Record<RoutePath, React.ReactNode> = {
	error: <div>Error</div>,
	open: <Open />,
	create: <Scenario />,
	home: <Home />,
	"create/faction": <Faction />,
	"create/opponent-faction": <Faction opponent={true} />,
	"create/custom-faction": <CustomFaction />,
};
