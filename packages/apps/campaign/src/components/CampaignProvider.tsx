import { createContext, createEffect, JSX, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

type CounterDataStore = { timer: number; multiplier: number; paused: boolean };
type CounterStore = [CounterDataStore, { setMultiplier?: (multiplier: number) => void; togglePause?: () => void }];

const initState: CounterDataStore = { timer: 0, multiplier: 1, paused: false };

export const CampaignContext = createContext<CounterStore>([initState, {}]);

export function CampaignProvider(props: { children?: JSX.Element }) {
	const [state, setState] = createStore(initState);
	let inter: number;

	const store: CounterStore = [
		state,
		{
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
