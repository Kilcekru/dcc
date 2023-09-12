import * as Components from "@kilcekru/dcc-lib-components";

import Styles from "./PersistenceModal.module.less";

export function PersistenceSuccessModal(props: { isOpen: boolean; onClose: () => void }) {
	return (
		<Components.Modal isOpen={props.isOpen} onClose={() => props.onClose()} class={Styles.modal}>
			<div class={Styles.content}>
				<p class={Styles.header}>Persistence updated</p>
				<p>Please restart DCS if it was open</p>
				<Components.Switch>Undo Persistence on Close</Components.Switch>
				<div class={Styles.buttons}>
					<Components.Button onPress={() => props.onClose()}>Continue</Components.Button>
				</div>
			</div>
		</Components.Modal>
	);
}
