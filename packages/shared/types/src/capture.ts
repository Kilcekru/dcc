import { BriefingDocument } from "./campaign";

export interface IPC {
	ready: () => void;
	renderComplete: () => void;
	onRequestRender: (listener: (docs: Document | undefined) => void) => void;
}

export type Document =
	| {
			type: "campaign.briefing";
			data: BriefingDocument;
	  }
	| {
			type: "campaign.test";
			data: { text: string };
	  };
