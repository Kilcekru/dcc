import { rpc } from "@kilcekru/dcc-lib-rpc";
import { useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { CampaignContext } from "./components";

export function useSave() {
	const [state] = useContext(CampaignContext);

	return () => {
		if (state.id === "") {
			return;
		}
		rpc.campaign
			.saveCampaign(unwrap(state))
			// eslint-disable-next-line no-console
			.catch((e) => console.error(e instanceof Error ? e.message : "unknown error"));
	};
}
