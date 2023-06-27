import * as Components from "@kilcekru/dcc-lib-components";
import { onEvent, rpc } from "@kilcekru/dcc-lib-rpc";
import { createSignal, useContext } from "solid-js";

import { CampaignContext, initState } from "../../../../components";
import Styles from "./ResetModal.module.less";

export const ResetModal = () => {
	const [, { reset }] = useContext(CampaignContext);
	const [isOpen, setIsOpen] = createSignal(false);

	onEvent("menu.campaign.reset", () => {
		setIsOpen(true);
	});

	const onConfirm = () => {
		reset?.();
		rpc.campaign.save({ ...initState, loaded: true, winner: undefined }).catch((err) => {
			console.error("RPC error", err); // eslint-disable-line no-console
		});
	};

	return (
		<Components.Modal isOpen={isOpen()} onClose={() => setIsOpen(false)} class={Styles["reset-modal"]}>
			<div class={Styles.content}>
				<p class={Styles.description}>Are you sure you want to reset the campaign?</p>
				<div class={Styles.buttons}>
					<Components.Button onPress={() => setIsOpen(false)} class={Styles["button--cancel"]}>
						Cancel
					</Components.Button>
					<Components.Button onPress={onConfirm}>Reset</Components.Button>
				</div>
			</div>
		</Components.Modal>
	);
};
