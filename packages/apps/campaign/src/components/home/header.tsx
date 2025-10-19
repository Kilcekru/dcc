import { useStore } from "@kilcekru/dcc-lib-components";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { useSelector } from "@xstate/store/react";
import { format } from "date-fns";
import { FastForward, Pause, Play } from "lucide-react";
import React, { useMemo } from "react";

import { campaignStore } from "../../stores/campaign";
import { timerControlStore } from "../../stores/timer-control";
import { Triggers } from "../../worker";
import { Button } from "../ui/button";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export function Header() {
	const name = useSelector(campaignStore, (state) => state.context.name);
	const time = useSelector(campaignStore, (state) => state.context.time);
	const timerState = useStore(timerControlStore, (state) => {
		if (state.timeMultiplier === 0) {
			return "pause";
		} else if (state.timeMultiplier === 1) {
			return "play";
		} else {
			return "fast-forward";
		}
	});

	const date = useMemo(() => {
		if (time == null) {
			return null;
		}
		return Utils.DateTime.timerToDate(time);
	}, [time]);

	const day = useMemo(() => {
		if (date == null) {
			return "-";
		}

		return date.getUTCDate() ?? "-";
	}, [date]);

	return (
		<div className="border-b border-[#ff00aa]/30 bg-[#0b0014]/90 px-4 py-2 flex">
			<div className="flex items-center justify-between flex-1">
				<h1 className="retro-font text-xl font-medium text-[#00ddff]">
					<span className="text-[#ff00aa]">OPERATION:</span> {name}
				</h1>
				<div className="flex items-center gap-4">
					{date == null ? null : (
						<div className="flex items-center gap-2 text-sm text-[#9900ff]">
							<span className="retro-font">
								Day {day} {format(date, "HH:mm:ss")} Zulu
							</span>
						</div>
					)}
					<ToggleGroup
						type="single"
						className="text-white"
						value={timerState}
						onValueChange={(value) => {
							switch (value) {
								case "pause":
									timerControlStore.set({ timeMultiplier: 0 });
									Triggers.pause();
									break;
								case "play":
									timerControlStore.set({ timeMultiplier: 1 });
									Triggers.resume(1);
									break;
								case "fast-forward":
									timerControlStore.set({ timeMultiplier: 300 });
									Triggers.resume(300);
									break;
							}
						}}
					>
						<ToggleGroupItem
							value="pause"
							variant="outline"
							className="h-8 w-8 border-[#ff00aa]/50 bg-[#0b0014]/80 text-[#ff00aa] hover:bg-[#ff00aa]/20"
						>
							<Pause className="h-4 w-4" />
						</ToggleGroupItem>
						<ToggleGroupItem
							value="play"
							variant="outline"
							className="h-8 w-8 border-[#ff00aa]/50 bg-[#0b0014]/80 text-[#ff00aa] hover:bg-[#ff00aa]/20"
						>
							<Play className="h-4 w-4" />
						</ToggleGroupItem>
						<ToggleGroupItem
							value="fast-forward"
							variant="outline"
							className="h-8 w-8 border-[#ff00aa]/50 bg-[#0b0014]/80 text-[#ff00aa] hover:bg-[#ff00aa]/20"
						>
							<FastForward className="h-4 w-4" />
						</ToggleGroupItem>
					</ToggleGroup>
					<Button
						variant="outline"
						size="sm"
						className="h-8 border-[#ff00aa]/50 bg-[#0b0014]/80 px-3 text-xs text-[#ff00aa] hover:bg-[#ff00aa]/20"
					>
						Takeoff
					</Button>
				</div>
			</div>
		</div>
	);
}
