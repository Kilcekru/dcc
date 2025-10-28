import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { Clock,Plane } from "lucide-react";
import React from "react";

import { getEntity } from "../../lib/get-entity";
import { getStateColor } from "../../lib/get-state-color";
import { getTaskColor } from "../../lib/get-task-color";
import { cn } from "../../lib/utils";
import { selectedEntityIdAtom } from "../../stores/entity-drawer";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent,TooltipTrigger } from "../ui/tooltip";

export function FlightGroup({
	group,
	selected,
}: {
	group: Types.Serialization.FlightGroupSerialized;
	selected?: boolean;
}) {
	const aircraftId = group.aircraftIds[0];
	const aircraft = aircraftId == null ? null : getEntity<Types.Serialization.AircraftSerialized>(aircraftId);
	const displayName = aircraft == null ? "" : DcsJs.aircraftDefinitions[aircraft.aircraftType].display_name;

	return (
		<div
			key={group.id}
			className={cn(
				"rounded-lg border border-[#9900ff]/20 bg-[#0b0014]/70 p-4 transform-gpu transition-all duration-200 hover:-translate-y-[3px] hover:scale-[1.025] hover:border-[#ff00aa] hover:bg-[#120024] hover:ring-1 hover:ring-[#ff00aa]",
				{
					"border-[#ff00aa]/50 bg-[#ff00aa]/10": selected,
				},
			)}
			onClick={() => selectedEntityIdAtom.set(group.id)}
		>
			<div className="flex items-start justify-between gap-3">
				<h3 className="retro-font text-base font-semibold text-white">{group.name}</h3>
			</div>
			<div className="mt-2 flex items-center gap-2">
				<Badge variant="outline" className={cn("text-xs", getTaskColor(group.task))}>{group.task}</Badge>
				<Badge variant="outline" className={cn("text-xs", getStateColor(group.state))}>{group.state}</Badge>
			</div>
			<div className="mt-4 flex items-center justify-between text-sm">
				<div className="flex items-center gap-2 text-[#9900ff]">
					<Plane className="h-4 w-4 text-[#00ddff]" />
					<span className="truncate">{displayName}</span>
				</div>
				<Tooltip>
					<TooltipTrigger>
						<div className="flex items-center gap-2 text-[#9900ff]">
							<Clock className="h-4 w-4 text-[#00ddff]" />
							<span>{Utils.Format.formatTime(group.startTime)}</span>
						</div>
					</TooltipTrigger>
					<TooltipContent sideOffset={4}>
						Start Time
					</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
}
