import type * as DcsJs from "@foxdelta2/dcsjs";
import { createContext, JSX } from "solid-js";
import { createStore, produce } from "solid-js/store";

type OverlayState =
	| "closed"
	| "structure"
	| "flight group"
	| "ground group"
	| "airdrome"
	| "ewr"
	| "sam"
	| "downed pilot"
	| "carrier";
type OverlayContextState = {
	state: OverlayState;
	structureName?: string;
	coalition?: DcsJs.Coalition;
	flightGroupId?: string;
	groundGroupId?: string;
	name?: string;
};
type OverlayStore = [
	OverlayContextState,
	{
		openStructure?: (structureName: string, coalition: DcsJs.Coalition) => void;
		openFlightGroup?: (flightGroupId: string, coalition: DcsJs.Coalition) => void;
		openGroundGroup?: (groundGroupId: string, coalition: DcsJs.Coalition) => void;
		openAirdrome?: (airdromeName: string, coalition: DcsJs.Coalition) => void;
		openEWR?: (id: string, coalition: DcsJs.Coalition) => void;
		openSam?: (id: string, coalition: DcsJs.Coalition) => void;
		openDownedPilot?: (id: string, coalition: DcsJs.Coalition) => void;
		openCarrier?: (name: string, coalition: DcsJs.Coalition) => void;
		close?: () => void;
	},
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
					}),
				);
			},
			openFlightGroup(flightGroupId, coalition) {
				setState(
					produce((s) => {
						s.state = "flight group";
						s.flightGroupId = flightGroupId;
						s.coalition = coalition;
					}),
				);
			},
			openGroundGroup(groundGroupId, coalition) {
				setState(
					produce((s) => {
						s.state = "ground group";
						s.groundGroupId = groundGroupId;
						s.coalition = coalition;
					}),
				);
			},
			openAirdrome(airdromeName, coalition) {
				setState(
					produce((s) => {
						s.state = "airdrome";
						s.name = airdromeName;
						s.coalition = coalition;
					}),
				);
			},
			openEWR(id, coalition) {
				setState(
					produce((s) => {
						s.state = "ewr";
						s.groundGroupId = id;
						s.coalition = coalition;
					}),
				);
			},
			openSam(id, coalition) {
				setState(
					produce((s) => {
						s.state = "sam";
						s.groundGroupId = id;
						s.coalition = coalition;
					}),
				);
			},
			openDownedPilot(id, coalition) {
				setState(
					produce((s) => {
						s.state = "downed pilot";
						s.groundGroupId = id;
						s.coalition = coalition;
					}),
				);
			},
			openCarrier(name, coalition) {
				setState(
					produce((s) => {
						s.state = "carrier";
						s.name = name;
						s.coalition = coalition;
					}),
				);
			},
			close() {
				setState("state", "closed");
			},
		},
	];

	return <OverlaySidebarContext.Provider value={store}>{props.children}</OverlaySidebarContext.Provider>;
}
