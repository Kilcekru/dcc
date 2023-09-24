import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { createSignal, Show } from "solid-js";

import Styles from "./PersistenceModal.module.less";

export function PersistenceModal(props: {
	isOpen: boolean;
	onClose: (ignore?: boolean) => void;
	onCancel: () => void;
}) {
	const [state, setState] = createSignal<"start" | "success" | "error">("start");

	const onClose = (ignore?: boolean) => {
		setState("start");
		props.onClose(ignore);
	};

	const onCancel = () => {
		setState("start");
		props.onCancel();
	};

	const onApplyPatch = async () => {
		try {
			await rpc.patches.executePatches([{ id: "scriptFileAccess", action: "apply" }]);
			await rpc.patches.executePatchOnQuit("scriptFileAccess", "clear");
			setState("success");
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error("PersistenceModal onApplyPatch", err);
			setState("error");
		}
	};

	const onChangeUndo = async (undo: boolean) => {
		try {
			await rpc.patches.executePatchOnQuit("scriptFileAccess", undo ? "clear" : "none");
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error("PersistenceModal onChangeUndo", err);
		}
	};

	return (
		<Components.Modal isOpen={props.isOpen} onClose={onClose} class={Styles.modal}>
			<div class={Styles.content}>
				<Show when={state() === "start"}>
					<p class={Styles.header}>Persistence is not activated</p>
					<p>Do you want to update the Settings?</p>
					<div class={Styles.buttons}>
						<Components.Button class={Styles["button--cancel"]} onPress={() => onClose(true)}>
							Ignore
						</Components.Button>
						<Components.Button onPress={onApplyPatch}>Confirm</Components.Button>
					</div>
				</Show>
				<Show when={state() === "success"}>
					<p class={Styles.header}>Persistence updated</p>
					<p>Please restart DCS if it was open</p>
					<Components.Switch checked={true} onChange={onChangeUndo}>
						Undo Persistence on Close
					</Components.Switch>
					<div class={Styles.buttons}>
						<Components.Button onPress={onClose}>Continue</Components.Button>
					</div>
				</Show>
				<Show when={state() === "error"}>
					<p class={Styles.header}>We couldn't update the Persistence Settings for you</p>
					<p>If you want to continue with the mission you need to enabled the Persistence Settings manually</p>
					<div class={Styles.buttons}>
						<Components.Button class={Styles["button--cancel"]} onPress={onCancel}>
							Cancel Mission
						</Components.Button>
						<Components.Button onPress={onClose}>Continue</Components.Button>
					</div>
				</Show>
			</div>
		</Components.Modal>
	);
}
