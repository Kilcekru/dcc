import { CampaignFlightGroup, CampaignState, FactionData } from "@kilcekru/dcc-shared-rpc-types";
import { createContext, createEffect, createUniqueId, JSX } from "solid-js";
import { createStore, produce } from "solid-js/store";

import { Minutes } from "../utils";

type CampaignStore = [
	CampaignState,
	{
		activate?: (blueFaction: FactionData, redFaction: FactionData) => void;
		setMultiplier?: (multiplier: number) => void;
		tick?: () => void;
		togglePause?: () => void;
		cleanupPackages?: () => void;
		addPackage?: (props: {
			side: "blue" | "red";
			task: string;
			startTime: number;
			endTime: number;
			airdrome: string;
			flightGroups: Array<CampaignFlightGroup>;
		}) => void;
		clearPackages?: () => void;
	}
];

const initState: CampaignState = {
	active: false,
	timer: 0,
	multiplier: 1,
	paused: false,
	blueFaction: undefined,
	redFaction: undefined,
};

export const CampaignContext = createContext<CampaignStore>([initState, {}]);

export function CampaignProvider(props: {
	children?: JSX.Element;
	campaignState: Partial<CampaignState> | null | undefined;
}) {
	const [state, setState] = createStore(initState);

	const store: CampaignStore = [
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
			tick() {
				setState("timer", (prev) => prev + state.multiplier);
			},
			togglePause() {
				setState("paused", (v) => !v);
			},
			cleanupPackages() {
				setState(
					produce((s) => {
						if (s.blueFaction != null) {
							const finishedPackages = s.blueFaction?.packages.filter((pkg) => pkg.endTime <= state.timer);

							const usedAircraftIds = finishedPackages.reduce((prev, pkg) => {
								const fgAircraftIds = pkg.flightGroups.reduce((prev, fg) => {
									return [...prev, ...fg.aircraftIds];
								}, [] as Array<string>);

								return [...prev, ...fgAircraftIds];
							}, [] as Array<string>);

							s.blueFaction.activeAircrafts = s.blueFaction.activeAircrafts.map((aircraft) => {
								if (usedAircraftIds.some((id) => aircraft.id === id)) {
									return {
										...aircraft,
										state: "maintenance",
										maintenanceEndTime: s.timer + Minutes(60),
									};
								} else {
									return aircraft;
								}
							});

							s.blueFaction.packages = s.blueFaction.packages.filter((pkg) => pkg.endTime > state.timer);
						}
					})
				);
			},
			addPackage({ task, startTime, endTime, airdrome, flightGroups }) {
				setState(
					produce((s) => {
						if (s.blueFaction != null) {
							const usedAircraftIds = flightGroups.reduce((prev, fg) => {
								return [...prev, ...fg.aircraftIds];
							}, [] as Array<string>);

							s.blueFaction.activeAircrafts = s.blueFaction.activeAircrafts.map((aircraft) => {
								if (usedAircraftIds.some((id) => aircraft.id === id)) {
									return {
										...aircraft,
										state: "en route",
									};
								} else {
									return aircraft;
								}
							});

							s.blueFaction.packages.push({
								endTime,
								id: createUniqueId(),
								startTime,
								task,
								airdrome,
								flightGroups,
							});
						}
					})
				);
			},
			clearPackages() {
				setState("blueFaction", "packages", () => []);
			},
		},
	];

	createEffect(() =>
		setState((state) => {
			if (props.campaignState == null) {
				return state;
			} else {
				return { ...state, ...props.campaignState };
			}
		})
	);

	return <CampaignContext.Provider value={store}>{props.children}</CampaignContext.Provider>;
}
