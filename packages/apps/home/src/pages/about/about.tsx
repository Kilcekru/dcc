import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import * as Types from "@kilcekru/dcc-shared-types";
import { createSignal, onMount, Show } from "solid-js";

import Styles from "./about.module.less";

export const About = () => {
	const [versions, setVersions] = createSignal<Types.Core.Versions>();
	/** undefined -> not created yet; null -> error while creating zip */
	const [supportZipPath, setSupportZipPath] = createSignal<string | null>();

	onMount(async () => {
		try {
			const versions = await rpc.misc.getVersions();
			setVersions(versions);
		} catch {
			console.error("Could not load versions"); // eslint-disable-line no-console
		}
	});

	const createSupportZip = async () => {
		const filePath = await rpc.home.createSupportZip();
		setSupportZipPath(filePath ?? null);
	};

	return (
		<div class={Styles.content}>
			<div class={Styles.wrapper}>
				<h1 class={Styles.title}>Digital Crew Chief</h1>
				<div class={Styles.text}>
					<p>Copyright (c) 2023 Kilcekru</p>
					<p>
						Version: {versions()?.app}
						<br />
						OS: {versions()?.os}
					</p>
					<p>
						DCC is available as open-source software and is being developed by SkyFury members Kilcekru and FoxDelta2.
					</p>
				</div>
				<div class={Styles.buttons}>
					<Components.Button onPress={() => rpc.misc.openExternalLink("https://discord.gg/jZZ3pFpY3e")}>
						Discord
					</Components.Button>
					<Components.Button onPress={() => rpc.misc.openExternalLink("https://github.com/Kilcekru/dcc")}>
						GitHub
					</Components.Button>
					<Components.Button
						onPress={() => rpc.misc.openExternalLink("https://github.com/Kilcekru/dcc/blob/main/LICENSE")}
					>
						License
					</Components.Button>
					<Components.Button onPress={() => rpc.misc.openExternalLink("https://youtube.com/@DigitalCrewChief")}>
						Youtube
					</Components.Button>
				</div>
				<div class={Styles.header}>Bug Reporting</div>
				<div class={Styles.text}>
					<p>
						We are happy if you want to help us by reporting bugs and suggesting ideas.
						<br />
						To make it easier for us to reproduce the issue, please attach a support zip to your report.
					</p>
					<p>
						The support zip contains the following information:
						<ul>
							<li>App and OS version</li>
							<li>Your current state of the campaign app</li>
							<li>Your last generated mission</li>
						</ul>
						All the information is anonymous.
					</p>
				</div>
				<div class={Styles.buttons}>
					<Components.Button onPress={() => createSupportZip()}>Create support zip</Components.Button>
					<Components.Button
						onPress={() => rpc.misc.openExternalLink("https://github.com/Kilcekru/dcc/blob/main/CONTRIBUTING.md")}
					>
						Report a Bug
					</Components.Button>
				</div>
			</div>
			<Components.Modal isOpen={supportZipPath() !== undefined} onClose={() => setSupportZipPath(undefined)}>
				<div class={Styles.header}>Support Zip</div>
				<Show
					when={supportZipPath() != undefined}
					fallback={
						<div class={Styles.text}>
							<p>There was an error while creating a support zip file.</p>
						</div>
					}
				>
					<div class={Styles.text}>
						<p>A support zip file has been created and saved here:</p>
						<p>{supportZipPath()}</p>
					</div>
				</Show>

				<div class={Styles.buttons}>
					<Components.Button class={Styles.button} onPress={() => setSupportZipPath(undefined)}>
						Ok
					</Components.Button>
				</div>
			</Components.Modal>
		</div>
	);
};
