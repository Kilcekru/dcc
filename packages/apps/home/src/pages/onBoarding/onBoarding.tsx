import { rpc } from "@kilcekru/dcc-lib-rpc";

import { useLoadUserConfig, useSetError } from "../../store";

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
		<>
			<h2>Installation successfull</h2>
			<div>
				<p>Digital Crew Chief has been installed.</p>
				<p>A shortcut to start DCC has been placed on your Desktop.</p>
				<p>You can now delete the setup file.</p>
			</div>
			<div>
				<button onClick={() => onSetupComplete()}>Continue</button>
			</div>
		</>
	);
};
