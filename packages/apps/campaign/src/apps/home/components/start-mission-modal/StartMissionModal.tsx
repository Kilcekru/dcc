import "./StartMissionModal.less";

import type * as DcsJs from "@foxdelta2/dcsjs";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { Button, CampaignContext, Modal } from "../../../../components";

export const StartMissionModal = (props: { isOpen?: boolean; onClose: () => void }) => {
	const [state] = useContext(CampaignContext);

	const onGenerate = () => {
		const unwrapped = unwrap(state);

		if (unwrapped.blueFaction == null || unwrapped.redFaction == null) {
			throw "faction not found";
		}

		const campaign: DcsJs.Campaign = unwrapped as DcsJs.Campaign;

		void rpc.campaign.generateCampaignMission(campaign);
	};

	return (
		<Modal isOpen={props.isOpen} onClose={() => props.onClose()}>
			<div class="start-mission-modal">
				<div>Start Mission</div>
				<Button onPress={onGenerate}>Generate</Button>
			</div>
		</Modal>
	);
};
