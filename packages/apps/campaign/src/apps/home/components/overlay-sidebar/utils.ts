import { useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";

export const useOverlayClose = () => {
	const [store, { close }] = useContext(OverlaySidebarContext);
	const [, { selectFlightGroup }] = useContext(CampaignContext);

	const onClose = () => {
		if (store.state === "flight group") {
			selectFlightGroup?.(undefined);
		}
		close?.();
	};

	return onClose;
};
