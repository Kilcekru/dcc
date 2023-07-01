import type * as DcsJs from "@foxdelta2/dcsjs";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { useContext } from "solid-js";

import { CampaignContext } from "./components";

export function useSave() {
	const [state] = useContext(CampaignContext);

	return () => {
		rpc.campaign.save(JSON.parse(JSON.stringify(state)) as DcsJs.CampaignState).catch((err) => {
			console.log("RPC error", err); // eslint-disable-line no-console
		});
	};
}
