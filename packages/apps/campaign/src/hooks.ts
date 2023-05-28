import { rpc } from "@kilcekru/dcc-lib-rpc";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { useContext } from "solid-js";

import { CampaignContext } from "./components";

export function useSave() {
	const [state] = useContext(CampaignContext);

	return () => {
		rpc.campaign.save(JSON.parse(JSON.stringify(state)) as CampaignState).catch((err) => {
			console.log("RPC error", err); // eslint-disable-line no-console
		});
	};
}
