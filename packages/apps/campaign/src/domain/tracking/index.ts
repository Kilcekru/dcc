import posthog from "posthog-js";

export function capture(name: string, payload: object) {
	posthog.capture(name, payload);
}

export function init() {
	posthog.init("key", { api_host: "url" });
}
