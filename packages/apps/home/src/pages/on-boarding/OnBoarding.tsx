import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";

import { useLoadUserConfig, useSetError } from "../../store";
import Styles from "./OnBoarding.module.less";

export const OnBoarding = () => {
	const setError = useSetError();
	const loadUserConfig = useLoadUserConfig();

	const onSetupComplete = async () => {
		try {
			await rpc.home.setSetupComplete();
			await loadUserConfig();
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Unknown error";
			setError(new Error(`onSetupComplete failed: ${msg}`));
		}
	};

	return (
		<div class={Styles.content}>
			<div class={Styles.wrapper}>
				<h1 class={Styles.title}>Installation successful</h1>
				<div class={Styles.description}>
					<p>Digital Crew Chief has been installed.</p>
					<p>A shortcut to start DCC has been placed on your Desktop.</p>
					<p>You can now delete the setup file.</p>
				</div>
				<div class={Styles.buttons}>
					<Components.Button large onPress={() => onSetupComplete()}>
						Continue
					</Components.Button>
				</div>
			</div>
		</div>
	);
};
