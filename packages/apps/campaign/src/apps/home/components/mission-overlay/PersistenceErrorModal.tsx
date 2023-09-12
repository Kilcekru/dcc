import * as Components from "@kilcekru/dcc-lib-components";

import Styles from "./PersistenceModal.module.less";

export function PersistenceErrorModal(props: { isOpen: boolean; onClose: () => void; onCancel: () => void }) {
	return (
		<Components.Modal isOpen={props.isOpen} onClose={() => props.onClose()} class={Styles.modal}>
			<div class={Styles.content}>
				<p class={Styles.header}>We couldn't update the Persistence Settings for you</p>
				<p>If you want to continue with the mission you need to enabled the Persistence Settings manually</p>
				<div class={Styles.buttons}>
					<Components.Button class={Styles["button--cancel"]} onPress={() => props.onCancel()}>
						Cancel Mission
					</Components.Button>
					<Components.Button onPress={() => props.onClose()}>Continue</Components.Button>
				</div>
			</div>
		</Components.Modal>
	);
}
