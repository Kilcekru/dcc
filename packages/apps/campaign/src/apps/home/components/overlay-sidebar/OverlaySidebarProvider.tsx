import * as DcsJs from "@foxdelta2/dcsjs";
import { createContext, JSX } from "solid-js";
import { createStore, produce } from "solid-js/store";

type OverlayState = "closed" | "structure" | "flight group";
type OverlayContextState = {
	state: OverlayState;
	structureName?: string;
	coalition?: DcsJs.CampaignCoalition;
	flightGroupId?: string;
};
type OverlayStore = [
	OverlayContextState,
	{
		openStructure?: (structureName: string, coalition: DcsJs.CampaignCoalition) => void;
		openFlightGroup?: (flightGroupId: string, coalition: DcsJs.CampaignCoalition) => void;
		close?: () => void;
	}
];

const initState: OverlayContextState = {
	state: "closed",
};

export const OverlaySidebarContext = createContext<OverlayStore>([initState, {}]);

export function OverlaySidebarProvider(props: { children: JSX.Element }) {
	const [state, setState] = createStore<OverlayContextState>({ state: "closed" });

	const store: OverlayStore = [
		state,
		{
			openStructure(structureName, coalition) {
				setState(
					produce((s) => {
						s.state = "structure";
						s.structureName = structureName;
						s.coalition = coalition;
					})
				);
			},
			openFlightGroup(flightGroupId, coalition) {
				setState(
					produce((s) => {
						s.state = "flight group";
						s.flightGroupId = flightGroupId;
						s.coalition = coalition;
					})
				);
			},
			close() {
				setState("state", "closed");
			},
		},
	];

	return <OverlaySidebarContext.Provider value={store}>{props.children}</OverlaySidebarContext.Provider>;
}
