import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import * as Utils from "@kilcekru/dcc-shared-utils";

import Styles from "./PersistenceModal.module.less";

export function PersistenceSuccessModal(props: { isOpen: boolean; onClose: () => void }) {
	const onChange = async (undo: boolean) => {
		try {
			await rpc.patches.executePatchOnQuit("scriptFileAccess", undo ? "clear" : "none");
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(`executePatchOnQuit: ${Utils.errMsg(err)}`);
		}
	};

	return (
		<Components.Modal isOpen={props.isOpen} onClose={() => props.onClose()} class={Styles.modal}>
			<div class={Styles.content}>
				<p class={Styles.header}>Persistence updated</p>
				<p>Please restart DCS if it was open</p>
				<Components.Switch onChange={onChange}>Undo Persistence on Close</Components.Switch>
				<div class={Styles.buttons}>
					<Components.Button onPress={() => props.onClose()}>Continue</Components.Button>
				</div>
			</div>
		</Components.Modal>
	);
}
