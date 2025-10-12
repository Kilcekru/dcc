import { createStore } from "@kilcekru/dcc-lib-components";

export type RouterStore = {
	route: "home" | "init" | "create" | "load-error";
};

export const routerStore = createStore<RouterStore>({
	route: "init",
});
