import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { Versions } from "@kilcekru/dcc-shared-rpc-types";
import { createSignal, onMount } from "solid-js";

import Styles from "./about.module.less";

export const About = () => {
	const [versions, setVersions] = createSignal<Versions>();

	onMount(async () => {
		try {
			const versions = await rpc.misc.getVersions();
			setVersions(versions);
		} catch {
			console.error("Could not load versions"); // eslint-disable-line no-console
		}
	});

	return (
		<div class={Styles.content}>
			<div class={Styles.wrapper}>
				<h1 class={Styles.title}>Digital Crew Chief</h1>
				<div class={Styles.header}>Copyright (c) 2023 Kilcekru</div>
				<div class={Styles.header}>
					Version: {versions()?.app}
					<br />
					OS: {versions()?.os}
				</div>
				<div class={Styles.description}>
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
						onPress={() => rpc.misc.openExternalLink("https://github.com/Kilcekru/dcc/blob/main/CONTRIBUTING.md")}
					>
						Report a Bug
					</Components.Button>
					<Components.Button
						onPress={() => rpc.misc.openExternalLink("https://github.com/Kilcekru/dcc/blob/main/LICENSE")}
					>
						License
					</Components.Button>
				</div>
			</div>
		</div>
	);
};
