import { createContext, createEffect, JSX, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

import { FactionStore } from "../types";

type CounterDataStore = {
	active: boolean;
	timer: number;
	multiplier: number;
	paused: boolean;
	blueFaction: FactionStore | undefined;
	redFaction: FactionStore | undefined;
};
type CounterStore = [
	CounterDataStore,
	{
		activate?: (blueFaction: FactionStore, redFaction: FactionStore) => void;
		setMultiplier?: (multiplier: number) => void;
		togglePause?: () => void;
	}
];

const initState: CounterDataStore = {
	active: false,
	timer: 0,
	multiplier: 1,
	paused: false,
	blueFaction: undefined,
	redFaction: undefined,
};

export const CampaignContext = createContext<CounterStore>([initState, {}]);

export function CampaignProvider(props: { children?: JSX.Element }) {
	const [state, setState] = createStore(initState);
	let inter: number;

	const store: CounterStore = [
		state,
		{
			activate(blueFaction, redFaction) {
				setState("active", () => true);
				setState("blueFaction", () => blueFaction);
				setState("redFaction", () => redFaction);
			},
			setMultiplier(multiplier: number) {
				setState("multiplier", multiplier);
			},
			togglePause() {
				setState("paused", (v) => !v);
			},
		},
	];

	const interval = () => setState("timer", (prev) => prev + state.multiplier);

	const startInterval = () => (inter = window.setInterval(interval, 1000));
	const stopInterval = () => window.clearInterval(inter);

	createEffect(() => {
		if (state.paused) {
			stopInterval();
		} else {
			startInterval();
		}
	});

	onCleanup(() => stopInterval());

	return <CampaignContext.Provider value={store}>{props.children}</CampaignContext.Provider>;
}
