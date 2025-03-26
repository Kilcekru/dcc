import { createStore } from "@kilcekru/dcc-lib-components";

export type TimerControlStore = {
	timeMultiplier: number;
};

export const timerControlStore = createStore<TimerControlStore>({
	timeMultiplier: 0,
});
