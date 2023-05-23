import * as DcsJs from "@foxdelta2/dcsjs";
import { createContext, JSX } from "solid-js";
import { createStore, produce } from "solid-js/store";

type OverlayState = "closed" | "structure" | "flight group" | "ground group" | "airdrome" | "ewr" | "sam";
type OverlayContextState = {
	state: OverlayState;
	structureName?: string;
	coalition?: DcsJs.CampaignCoalition;
	flightGroupId?: string;
	groundGroupId?: string;
	airdromeName?: string;
};
type OverlayStore = [
	OverlayContextState,
	{
		openStructure?: (structureName: string, coalition: DcsJs.CampaignCoalition) => void;
		openFlightGroup?: (flightGroupId: string, coalition: DcsJs.CampaignCoalition) => void;
		openGroundGroup?: (groundGroupId: string, coalition: DcsJs.CampaignCoalition) => void;
		openAirdrome?: (airdromeName: string, coalition: DcsJs.CampaignCoalition) => void;
		openEWR?: (id: string, coalition: DcsJs.CampaignCoalition) => void;
		openSam?: (id: string, coalition: DcsJs.CampaignCoalition) => void;
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
			openGroundGroup(groundGroupId, coalition) {
				setState(
					produce((s) => {
						s.state = "ground group";
						s.groundGroupId = groundGroupId;
						s.coalition = coalition;
					})
				);
			},
			openAirdrome(airdromeName, coalition) {
				setState(
					produce((s) => {
						s.state = "airdrome";
						s.airdromeName = airdromeName;
						s.coalition = coalition;
					})
				);
			},
			openEWR(id, coalition) {
				setState(
					produce((s) => {
						s.state = "ewr";
						s.groundGroupId = id;
						s.coalition = coalition;
					})
				);
			},
			openSam(id, coalition) {
				setState(
					produce((s) => {
						s.state = "sam";
						s.groundGroupId = id;
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
