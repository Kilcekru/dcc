import React from "react";

import { About } from "./routes/about";
import { Home } from "./routes/home";
import { Onboarding } from "./routes/onboarding";
import { Settings } from "./routes/settings";

const routePaths = ["home", "onboarding", "about", "settings"] as const;
export type RoutePath = (typeof routePaths)[number];

export const routerRecord: Record<RoutePath, React.ReactNode> = {
	home: <Home />,
	onboarding: <Onboarding />,
	about: <About />,
	settings: <Settings />,
};
