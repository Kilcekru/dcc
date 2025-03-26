import React, { useMemo } from "react";
import { useStore } from "@kilcekru/dcc-lib-components";
import { campaignStore } from "../../stores/campaign";
import { format } from "date-fns";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { Button } from "../ui/button";
import { FastForward, Pause, Play } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { timerControlStore } from "../../stores/timer-control";
import { Triggers } from "../../worker";

export function Header() {
    const name = useStore(campaignStore, (state) => state.campaign?.name);
    const time = useStore(campaignStore, (state) => state.campaign?.time);
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

        return Utils.DateTime.timerToDate(time)
    }, [time]);

    const day = useMemo(() => {
        if (date == null) {
            return "-";
        }

        return date.getUTCDate() ?? "-";
    }, [date]);

    return <div className="w-full h-16 flex items-center justify-between px-4">
        <h1 className="text-white">{name}</h1>
        <div className="flex flex-col items-center gap-2">
            {date == null ? null : <div className="text-white flex">
                <p className="mr-1">Day {day}</p>
                <p>{format(date, "HH:mm")}</p>
            </div>}
            <ToggleGroup type="single" className="text-white" value={timerState} onValueChange={(value) => {
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
            }}>
                <ToggleGroupItem value="pause" variant="outline"><Pause /></ToggleGroupItem>
                <ToggleGroupItem value="play" variant="outline"><Play /></ToggleGroupItem>
                <ToggleGroupItem value="fast-forward" variant="outline"><FastForward /></ToggleGroupItem>
            </ToggleGroup>
        </div>
        <Button>
            Takeoff
        </Button>
    </div>
}


