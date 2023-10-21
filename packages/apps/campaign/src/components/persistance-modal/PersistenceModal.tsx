import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import * as Types from "@kilcekru/dcc-shared-types";
import { createEffect, createSignal, Match, onMount, Switch } from "solid-js";

import { useModalContext, useSetIsPersistanceModalOpen } from "../modalProvider";
import Styles from "./PersistenceModal.module.less";

export function PersistenceModal() {
	const modalContext = useModalContext();
	const setIsPersistanceModalOpen = useSetIsPersistanceModalOpen();

	const [mode, setMode] = createSignal<Types.Patch.Mode | null>(null);
	const [selected, setSelected] = createSignal<Types.Patch.Mode | null>(null);
	const [error, setError] = createSignal<Error>();

	const loadPersistanceState = async () => {
		try {
			const mode = await rpc.patches.getPatchMode("scriptFileAccess");
			setMode(mode);
			setSelected(mode);
		} catch {
			setMode(null);
			setSelected(null);
		}
	};

	createEffect(() => {
		if (modalContext.isPersistanceModalOpen) {
			void loadPersistanceState();
		}
	});

	onMount(async () => {
		void loadPersistanceState();
	});

	const reset = async () => {
		await loadPersistanceState();
		setError();
	};

	const onClose = () => {
		setSelected(mode());
		setIsPersistanceModalOpen(false);
	};

	const onSave = async () => {
		const newMode = selected();
		if (newMode == null) {
			setError(new Error("No mode selected"));
			return;
		}
		try {
			await rpc.patches.setPatchModes([{ id: "scriptFileAccess", mode: newMode }]);
			await loadPersistanceState();
			setIsPersistanceModalOpen(false);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error("PersistenceModal setPatchModes", err);
			setError(err instanceof Error ? err : new Error("Setting Persistance failed"));
		}
	};

	return (
		<Components.Modal isOpen={modalContext.isPersistanceModalOpen} onClose={onClose} class={Styles.modal}>
			<div class={Styles.content}>
				<p class={Styles.header}>DCS file persistance</p>
				<Switch fallback={<PersistanceFallback onClose={onClose} />}>
					<Match when={error()}>
						<PersistanceError onClose={onClose} onReset={reset} />
					</Match>
					<Match when={selected()}>
						{(selectedMode) => (
							<PersistenceSelector mode={selectedMode()} setMode={setSelected} onClose={onClose} onSave={onSave} />
						)}
					</Match>
				</Switch>
			</div>
		</Components.Modal>
	);
}

interface PersistenceSelectorProps {
	mode: Types.Patch.Mode;
	setMode: (mode: Types.Patch.Mode) => void;
	onSave: () => void;
	onClose: () => void;
}
function PersistenceSelector(props: PersistenceSelectorProps) {
	return (
		<>
			<Components.RadioGroup id={props.mode} onChange={(value) => props.setMode(value as Types.Patch.Mode)}>
				<Components.RadioItem id="auto">
					Enabled while DCC is running <span class={Styles.comment}>(Recommended)</span>
				</Components.RadioItem>
				<Components.RadioItem id="enabled">Always enabled</Components.RadioItem>
				<Components.RadioItem id="disabled">Always disabled</Components.RadioItem>
			</Components.RadioGroup>

			<PersistanceComment />

			<div class={Styles.buttons}>
				<Components.Button class={Styles["button--cancel"]} onPress={props.onClose}>
					Cancel
				</Components.Button>
				<Components.Button onPress={props.onSave}>Confirm</Components.Button>
			</div>
		</>
	);
}

interface PersistanceFallbackProps {
	onClose: () => void;
}
function PersistanceFallback(props: PersistanceFallbackProps) {
	const [dcsAvailable, setDcsAvailable] = createSignal<boolean>();

	onMount(async () => {
		try {
			const userConfig = await rpc.misc.getUserConfig();
			setDcsAvailable(userConfig.dcs.available);
		} catch {
			setDcsAvailable();
		}
	});

	return (
		<>
			<p>
				DCC can't apply changes to your DSC settings
				{dcsAvailable() ? "" : " because you have not set up the DCS directory"}.
			</p>
			<p>You have to manually edit the file 'Scripts/MissionScripting.lua' in your DCS installation directory.</p>
			<PersistanceComment />
			<div class={Styles.buttons}>
				<Components.Button onPress={props.onClose}>Close</Components.Button>
			</div>
		</>
	);
}

interface PersistanceErrorProps {
	onReset: () => void;
	onClose: () => void;
}
function PersistanceError(props: PersistanceErrorProps) {
	return (
		<>
			<p>Something went wrong while trying to apply your current settings.</p>
			<p>You can try again or do the changes manually.</p>
			<PersistanceComment />
			<div class={Styles.buttons}>
				<Components.Button class={Styles["button--cancel"]} onPress={props.onClose}>
					Cancel
				</Components.Button>
				<Components.Button onPress={props.onReset}>Try Again</Components.Button>
			</div>
		</>
	);
}

function PersistanceComment() {
	return (
		<p class={Styles.comment}>
			DCS does not allow saving state from missions per default (for security reasons).
			<br />
			A small change in DCS settings is necessary for persistance to work. If the generated mission is hosted on a
			dedicated server, the change needs to be applied there.
			<br />
			<a onClick={() => rpc.misc.openExternalLink("https://github.com/Kilcekru/dcc#persistence")}>Read more</a>
		</p>
	);
}
