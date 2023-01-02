import { CampaignCoalition } from "@kilcekru/dcc-shared-rpc-types";
import { useContext } from "solid-js";

import { CampaignContext } from "./components";

export const useFaction = (coalition: CampaignCoalition) => {
	const [state] = useContext(CampaignContext);

	return coalition === "blue" ? state.blueFaction : coalition === "red" ? state.redFaction : undefined;
};
