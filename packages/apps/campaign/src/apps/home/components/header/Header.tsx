import type * as DcsJs from "@foxdelta2/dcsjs";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { Button, CampaignContext } from "../../../../components";
import styles from "./Header.module.less";

export const Header = (props: { showMissionModal: () => void }) => {
	const [state, { pause }] = useContext(CampaignContext);

	const onGenerateMission = async () => {
		pause?.();

		const unwrapped = unwrap(state);

		if (unwrapped.blueFaction == null || unwrapped.redFaction == null) {
			throw "faction not found";
		}

		const campaign: DcsJs.Campaign = unwrapped as DcsJs.Campaign;

		await rpc.campaign.generateCampaignMission(campaign);

		props.showMissionModal();
	};

	return (
		<div class={styles.header}>
			<h1>
				{state.blueFaction?.name} vs {state.redFaction?.name}
			</h1>
			<Button onPress={onGenerateMission}>Generate Mission</Button>
		</div>
	);
};
