import { RunningCampaignState } from "../types";
import { a2a } from "./a2a";
import { cas } from "./cas";
import { dead } from "./dead";
import { sam } from "./sam";
import { strike } from "./strike";

export const combatRound = (state: RunningCampaignState) => {
	cas("blue", state);
	cas("red", state);
	dead("blue", state);
	dead("red", state);
	strike("blue", state);
	strike("red", state);
	sam("blue", state);
	sam("red", state);
	a2a(state);
};

export * from "./g2g";
