import * as Components from "@kilcekru/dcc-lib-components";
import { Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";

export const GameOverModal = () => {
	const [state] = useContext(CampaignContext);

	return (
		<Components.Modal isOpen={state.winner != null} onClose={() => null}>
			<div class="game-over-modal">
				<Show when={state.winner === "blue"}>
					<div>You Won!</div>
				</Show>
				<Show when={state.winner === "red"}>
					<div>You Lost!</div>
				</Show>
				<div>
					{" "}
					Aircrafts Lost:{" "}
					{Object.values(state.blueFaction?.inventory.aircrafts ?? []).filter((ac) => ac.alive === false).length}
				</div>
				<div>
					Aircrafts Destroyed:{" "}
					{Object.values(state.blueFaction?.inventory.aircrafts ?? []).filter((ac) => ac.alive === false).length}
				</div>
			</div>
		</Components.Modal>
	);
};
