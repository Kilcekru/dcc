import { sendWorkerMessage } from "./worker";

export function useSave() {
	return () => {
		sendWorkerMessage({
			name: "serialize",
		});
	};
}
