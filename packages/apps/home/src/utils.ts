import { rpc } from "@kilcekru/dcc-lib-rpc";
import { userConfigStore } from "./stores/user-config";

export async function loadUserConfig() {
	try {
		const config = await rpc.misc.getUserConfig();
		userConfigStore.set({
			config,
		});
	} catch (err) {
		const msg = err instanceof Error ? err.message : "Unknown error";
		userConfigStore.set({
			error: new Error(`getUserConfig failed: ${msg}`),
		});
	}
}
