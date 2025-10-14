import * as Types from "@kilcekru/dcc-shared-types";
import { useSelector } from "@xstate/store/react";
import { Plane, Users } from "lucide-react";
import React from "react";

import { getEntity } from "../../lib/get-entity";
import { cn } from "../../lib/utils";
import { campaignStore } from "../../stores/campaign";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const getStatusColor = (status: string) => {
	switch (status) {
		case "Ready":
			return "bg-[#00ffaa]/10 text-[#00ffaa]";
		case "En Route":
			return "bg-[#00ddff]/10 text-[#00ddff]";
		case "Maintenance":
			return "bg-[#ffcc00]/10 text-[#ffcc00]";
		default:
			return "bg-gray-100/10 text-gray-500";
	}
};

export function FlightGroupList() {
	const [selectedFlightGroup, setSelectedFlightGroup] =
		React.useState<Types.Serialization.FlightGroupSerialized | null>(null);
	const flightGroups = useSelector(campaignStore, (state) => state.context.campaign?.flightGroups);
	const blueFlightGroups = React.useMemo(() => flightGroups?.filter((group) => group.coalition === "blue"), [flightGroups]);

	return (
		<Card className="flex-1 border-[#ff00aa]/30 bg-[#0b0014]/80 text-[#e0e0ff] shadow-[0_0_15px_rgba(255,0,170,0.3)]" >
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-lg font-medium text-white">
					<Users className="h-4 w-4 text-[#ff00aa]" />
					<span className="retro-font">Flight Groups</span>
				</CardTitle>
				<CardDescription className="text-[#9900ff]">Available squadrons and their status</CardDescription>
			</CardHeader>
			<CardContent className="p-0">
				<Tabs defaultValue="list" className="w-full">
					<TabsList className="grid w-full grid-cols-2 bg-[#0b0014]">
						<TabsTrigger
							value="list"
							className="data-[state=active]:bg-[#ff00aa]/20 data-[state=active]:text-[#ff00aa]"
						>
							List View
						</TabsTrigger>
						<TabsTrigger
							value="details"
							className="data-[state=active]:bg-[#ff00aa]/20 data-[state=active]:text-[#ff00aa]"
						>
							Details
						</TabsTrigger>
					</TabsList>
					<TabsContent value="list" className="p-4">
						<div className="space-y-3">
							{blueFlightGroups?.map((group) => {
								const aircraftId = group.aircraftIds[0];
								const aircraft = aircraftId == null ? null : getEntity<Types.Serialization.AircraftSerialized>(aircraftId);

								return <div
									key={group.id}
									className={cn(
										"rounded-md border border-[#9900ff]/30 bg-[#0b0014]/80 p-3 transition-colors hover:bg-[#9900ff]/10",
										selectedFlightGroup?.id === group.id && "border-[#ff00aa]/50 bg-[#ff00aa]/10",
									)}
									onClick={() => setSelectedFlightGroup(group)}
								>
									<div className="flex items-center justify-between">
										<h3 className="retro-font font-medium text-white">{group.name}</h3>
										{/*<Badge className={cn("text-xs", getStatusColor(group.status))}>{group.status}</Badge>*/}
									</div>
									<div className="mt-2 flex items-center justify-between text-sm">
										<div className="flex items-center gap-1">
											<Plane className="h-3.5 w-3.5 text-[#00ddff]" />
											<span className="text-[#9900ff]">{aircraft?.aircraftType}</span>
										</div>
										<span className="text-[#9900ff]">x{group.aircraftIds.length}</span>
									</div>
								</div>
							})}
						</div>
					</TabsContent>
					<TabsContent value="details" className="p-4">
						{selectedFlightGroup && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="retro-font text-lg font-medium text-white">{selectedFlightGroup.name}</h3>
									<Badge className={cn("text-xs", getStatusColor(/* selectedFlightGroup.status */ "Ready"))}>
										{/* selectedFlightGroup.status */}
									</Badge>
								</div>

								{/* <div className="space-y-3 rounded-md border border-[#9900ff]/30 bg-[#0b0014]/80 p-3">
								<div className="grid grid-cols-2 gap-y-2 text-sm">
									<div>
										<span className="text-[#9900ff]">Aircraft:</span>
									</div>
									<div className="text-right">{selectedFlightGroup.aircraft}</div>

									<div>
										<span className="text-[#9900ff]">Count:</span>
									</div>
									<div className="text-right">{selectedFlightGroup.count}</div>

									<div>
										<span className="text-[#9900ff]">Mission:</span>
									</div>
									<div className="text-right">{selectedFlightGroup.mission}</div>

									<div>
										<span className="text-[#9900ff]">Readiness:</span>
									</div>
									<div className="text-right">{selectedFlightGroup.readiness}%</div>
								</div>

								<div className="h-2 overflow-hidden rounded-full bg-[#0b0014]">
									<div
										className="h-full bg-gradient-to-r from-[#ffcc00] to-[#00ffaa]"
										style={{ width: `${selectedFlightGroup.readiness}%` }}
									/>
								</div>
							</div> */}

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
										disabled={/* selectedFlightGroup.status !== "Ready" */ true}
									>
										Deploy
									</Button>
								</div>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card >
	);
}
