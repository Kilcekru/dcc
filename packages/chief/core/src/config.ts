import * as Types from "@kilcekru/dcc-shared-types";

declare const BUILD_ENV: "dev" | "pro";
const debugMode = process.argv.includes("--debug");

export const config: Types.Core.SystemConfig = {
	env: debugMode ? "dev" : BUILD_ENV,
};
