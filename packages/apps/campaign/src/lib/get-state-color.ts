import * as Types from "@kilcekru/dcc-shared-types";

export function getStateColor(state: Types.Serialization.FlightGroupState) {
	switch (state) {
		case "waiting":
			return "bg-[#00ffaa]/10 text-[#00ffaa]";
		case "start up":
			return "bg-[#00ddff]/10 text-[#00ddff]";
		case "in air":
			return "bg-[#ffcc00]/10 text-[#ffcc00]";
		case "landed":
			return "bg-[#9900ff]/10 text-[#9900ff]";
		case "destroyed":
			return "bg-gray-100/10 text-gray-500";
		default:
			return "bg-gray-100/10 text-gray-500";
	}
}
