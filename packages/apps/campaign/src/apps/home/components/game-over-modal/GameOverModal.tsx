import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { closeCampaign } from "../../../../hooks";
import Styles from "./GameOverModal.module.less";

export const GameOverModal = () => {
	const [state] = useContext(CampaignContext);

	const onConfirm = async () => {
		const id = state.id;
		await rpc.campaign.removeCampaign(id);
		closeCampaign();
	};

	return (
		<Components.Modal isOpen={state.winner != null} onClose={() => null} disableClose>
			<div class={Styles.content}>
				<Show when={state.winner === "blue"}>
					<div class={Styles.description}>You Won!</div>
				</Show>
				<Show when={state.winner === "red"}>
					<Show when={state.hardcore === "killed"}>
						<div class={Styles.description}>Killed in Action!</div>
					</Show>
					<Show when={state.hardcore !== "killed"}>
						<div class={Styles.description}>You Lost!</div>
					</Show>
				</Show>
				<div class={Styles.buttons}>
					<Components.Button onPress={onConfirm}>New Campaign</Components.Button>
				</div>
			</div>
		</Components.Modal>
	);
};
