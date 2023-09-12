import * as Components from "@kilcekru/dcc-lib-components";

import Styles from "./PersistenceModal.module.less";

export function PersistenceModal(props: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) {
	return (
		<Components.Modal isOpen={props.isOpen} onClose={() => props.onClose()} class={Styles.modal}>
			<div class={Styles.content}>
				<p class={Styles.header}>Persistence is not activated</p>
				<p>Do you want to update the Settings?</p>
				<div class={Styles.buttons}>
					<Components.Button class={Styles["button--cancel"]} onPress={() => props.onClose()}>
						Ignore
					</Components.Button>
					<Components.Button onPress={() => props.onConfirm()}>Confirm</Components.Button>
				</div>
			</div>
		</Components.Modal>
	);
}
