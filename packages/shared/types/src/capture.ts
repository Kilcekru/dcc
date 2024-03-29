import { BriefingDocument } from "./campaign";

export interface IPC {
	onInitialize: (listener: () => void) => void;
	onRequestRender: (listener: (docs: Document) => void) => void;
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
