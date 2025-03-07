import * as toast from "@zag-js/toast";

// 1. Create the toast store
export const toaster = toast.createStore({
	placement: "top-end",
	overlap: true,
});

export function Toaster() {
	return null;
}
