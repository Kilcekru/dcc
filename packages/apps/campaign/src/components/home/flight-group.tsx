import * as Types from "@kilcekru/dcc-shared-types";
import { Plane } from "lucide-react";
import React from "react";

import { getEntity } from "../../lib/get-entity";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";

const getStateColor = (state: Types.Serialization.FlightGroupState) => {
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
};

export function FlightGroup({
	group,
	selected,
	onSelect,
}: {
	group: Types.Serialization.FlightGroupSerialized;
	selected?: boolean;
	onSelect?: () => void;
}) {
	const aircraftId = group.aircraftIds[0];
	const aircraft = aircraftId == null ? null : getEntity<Types.Serialization.AircraftSerialized>(aircraftId);

	return (
		<div
			key={group.id}
			className={cn(
				"rounded-md border border-[#9900ff]/30 bg-[#0b0014]/80 p-3 transition-colors hover:bg-[#9900ff]/10 cursor-pointer",
				{
					"border-[#ff00aa]/50 bg-[#ff00aa]/10": selected,
				},
			)}
			onClick={onSelect}
		>
			<div className="flex items-center justify-between">
				<h3 className="retro-font font-medium text-white">{group.name}</h3>
				<Badge className={cn("text-xs", getStateColor(group.state))}>{group.state}</Badge>
			</div>
			<div className="mt-2 flex items-center justify-between text-sm">
				<div className="flex items-center gap-1">
					<Plane className="h-3.5 w-3.5 text-[#00ddff]" />
					<span className="text-[#9900ff]">{aircraft?.aircraftType}</span>
				</div>
				<span className="text-[#9900ff]">x{group.aircraftIds.length}</span>
			</div>
		</div>
	);
}
