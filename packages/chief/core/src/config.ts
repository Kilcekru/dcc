import { SystemConfig } from "@kilcekru/dcc-shared-rpc-types";

declare const BUILD_ENV: "dev" | "pro";
const debugMode = process.argv.includes("--debug");

export const config: SystemConfig = {
	env: debugMode ? "dev" : BUILD_ENV,
};
