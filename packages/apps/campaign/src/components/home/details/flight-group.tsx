import { cn } from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types"
import React from "react"

import { getStateColor } from "../../../lib/get-state-color";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";

export function FlightGroup({ flightGroup }: { flightGroup: Types.Serialization.FlightGroupSerialized }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="retro-font text-lg font-medium text-white">{flightGroup.name}</h3>
                <Badge className={cn("text-xs", getStateColor(flightGroup.state))}>
                    {flightGroup.state}
                </Badge>
            </div>

            <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="border-[#9900ff]/50 bg-[#0b0014]/80 text-[#00ddff] hover:bg-[#9900ff]/20"
                >
                    Assign Mission
                </Button>
                <Button
                    size="sm"
                    className="bg-[#ff00aa] text-white hover:bg-[#ff00aa]/80"
                    disabled={flightGroup.state !== "waiting"}
                >
                    Deploy
                </Button>
            </div>
        </div>
    )
}