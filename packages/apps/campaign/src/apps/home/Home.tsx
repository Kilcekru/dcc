import { onEvent } from "@kilcekru/dcc-lib-rpc";
import { ErrorBoundary, onCleanup, onMount, useContext } from "solid-js";

import { CampaignContext, MapContainer } from "../../components";
import { Header, NextDayModal, OverlaySidebar, OverlaySidebarProvider, Sidebar } from "./components";
import styles from "./Home.module.less";

export const Home = () => {
	const [, { togglePause }] = useContext(CampaignContext);

	/* const createToast = useCreateToast();
	const createErrorToast = useCreateErrorToast(); */

	// TODO
	/* createEffect(() => {
		const ids: Array<string> = [];
		state.toastMessages.forEach((msg) => {
			switch (msg.type) {
				case "error": {
					createErrorToast({
						description: msg.description,
						title: msg.title,
					});
					break;
				}
				default: {
					createToast({
						description: msg.description,
						title: msg.title,
					});
				}
			}
			ids.push(msg.id);
		});

		if (ids.length > 0) {
			clearToastMessages?.(ids);
		}
	}); */

	const onKeyUp = (e: KeyboardEvent) => {
		if (e.code === "Space") {
			togglePause?.();
		}
	};

	onMount(() => document.addEventListener("keyup", onKeyUp));

	onCleanup(() => document.removeEventListener("keyup", onKeyUp));

	onEvent("menu.campaign.new", () => {
		// TODO
		// rpc.campaign.saveCampaign(unwrap(state)).catch(Domain.Utils.catchAwait);
	});

	return (
		<OverlaySidebarProvider>
			<div class={styles.home}>
				<Header />
				<Sidebar />
				<OverlaySidebar />
				<div class={styles.content}>
					<ErrorBoundary fallback={<div>Something went terribly wrong</div>}>
						<MapContainer />
					</ErrorBoundary>
				</div>
				<NextDayModal />
			</div>
		</OverlaySidebarProvider>
	);
};
