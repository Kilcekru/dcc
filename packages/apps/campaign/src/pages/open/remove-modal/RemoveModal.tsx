import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";

import Styles from "./RemoveModal.module.less";

export const RemoveModal = (props: {
	isOpen: boolean;
	synopsis: Types.Campaign.CampaignSynopsis | undefined;
	onConfirm: (id: string) => void;
	onCancel: () => void;
}) => {
	return (
		<Components.Modal isOpen={props.isOpen} onClose={() => props.onCancel()} class={Styles["reset-modal"]}>
			<div class={Styles.content}>
				<p class={Styles.description}>
					Are you sure you want to remove the campaign
					{/* Are you sure you want to remove the campaign {props.synopsis?.name} - {props.synopsis?.factionName}? TODO */}
				</p>
				<div class={Styles.buttons}>
					<Components.Button onPress={() => props.onCancel()} class={Styles["button--cancel"]}>
						Cancel
					</Components.Button>
					<Components.Button onPress={() => (props.synopsis == null ? null : props.onConfirm(props.synopsis.id))}>
						Remove
					</Components.Button>
				</div>
			</div>
		</Components.Modal>
	);
};
