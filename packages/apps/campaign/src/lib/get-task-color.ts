import * as Types from "@kilcekru/dcc-shared-types";

export function getTaskColor(task: Types.Serialization.FlightGroupSerialized["task"]) {
	// Map common tasks to themed colors; fallback to neutral if unknown
	switch (task) {
		case "CAP":
		case "Escort":
		case "Fighter Sweep":
		case "Intercept":
			return "bg-[#00ddff]/10 text-[#00ddff]";
		case "SEAD":
		case "DEAD":
			return "bg-[#ff00aa]/10 text-[#ff00aa]";
		case "CAS":
		case "Ground Attack":
		case "Pinpoint Strike":
		case "Runway Attack":
		case "Antiship Strike":
			return "bg-[#ffcc00]/10 text-[#ffcc00]";
		case "CSAR":
		case "RescueHelo":
		case "Air Assault":
			return "bg-[#00ffaa]/10 text-[#00ffaa]";
		case "AWACS":
		case "AFAC":
			return "bg-[#9900ff]/10 text-[#9900ff]";
		case "Transport":
		case "Refueling":
			return "bg-[#c3b3ff]/10 text-[#c3b3ff]";
		default:
			return "bg-gray-100/10 text-gray-500";
	}
}
