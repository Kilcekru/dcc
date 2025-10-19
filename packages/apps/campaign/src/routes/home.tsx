import { cn } from "@kilcekru/dcc-lib-components";
import { Eye, Info, Sun, Target, Wind } from "lucide-react";
import React from "react";

import { FlightGroupList } from "../components/home/flight-group-list";
import { Header } from "../components/home/header";
import { Map } from "../components/home/map/map";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const campaignData = {
	description:
		"A daring raid on a heavily fortified enemy airbase. Intelligence suggests they are preparing a large-scale offensive. Your mission: cripple their air power before they can launch.",
	windSpeed: "15 knots",
	windDirection: "NW",
	temperature: "28°C",
	visibility: "10 km",
	objectives: ["Destroy the primary fuel depot", "Disable the runway", "Eliminate enemy air patrol"],
};

export function Home() {
	const [mapZoom, setMapZoom] = React.useState(1);

	return (
		<div className="bg-[#0b0014] text-[#e0e0ff]">
			<Header />

			{/* Main content */}
			<div className="relative flex h-[calc(100vh-56px)] w-full overflow-hidden">
				{/* Map - takes most of the screen */}
				<div className="relative flex-1 overflow-hidden">
					<div className="absolute inset-0 flex flex-col overflow-hidden">
						<div className="flex items-center justify-between border-b border-[#ff00aa]/30 bg-[#0b0014]/80 px-4 py-2">
							<h2 className="retro-font text-sm font-medium text-[#00ddff]">TACTICAL MAP</h2>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									className="h-7 border-[#ff00aa]/50 bg-[#0b0014]/80 px-2 text-xs text-[#ff00aa] hover:bg-[#ff00aa]/20"
									onClick={() => setMapZoom(Math.max(0.5, mapZoom - 0.5))}
								>
									-
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="h-7 border-[#ff00aa]/50 bg-[#0b0014]/80 px-2 text-xs text-[#ff00aa] hover:bg-[#ff00aa]/20"
									onClick={() => setMapZoom(Math.min(2, mapZoom + 0.5))}
								>
									+
								</Button>
							</div>
						</div>
						<div className="relative flex-1 overflow-hidden">
							{/* Synthwave grid background */}
							<div
								className="absolute inset-0 z-0"
								style={{
									backgroundImage:
										"linear-gradient(to right, rgba(255, 0, 170, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 0, 170, 0.3) 1px, transparent 1px)",
									backgroundSize: "40px 40px",
									perspective: "1000px",
									perspectiveOrigin: "center",
									transform: "rotateX(60deg)",
									backgroundPosition: "center",
								}}
							/>

							{/* Horizon glow */}
							<div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-[#ff00aa] via-[#9900ff] to-transparent opacity-30" />

							<Map />
						</div>
					</div>
				</div>

				{/* Sidebar - Flight groups and info */}
				<div
					className={cn(
						"h-full w-[350px] flex-shrink-0 overflow-y-auto border-l border-[#ff00aa]/30 bg-[#0b0014]/90 transition-all duration-300",
						"fixed right-0 top-[56px] z-10 lg:relative lg:top-0",
					)}
				>
					<div className="flex h-full flex-col gap-4 p-4">
						{/* Campaign info */}
						<Card className="border-[#ff00aa]/30 bg-[#0b0014]/80 text-[#e0e0ff] shadow-[0_0_15px_rgba(255,0,170,0.3)]">
							<CardHeader className="pb-2">
								<CardTitle className="flex items-center gap-2 text-lg font-medium text-white">
									<Info className="h-4 w-4 text-[#ff00aa]" />
									<span className="retro-font">Campaign Briefing</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-3 text-sm">
									<div className="flex items-center gap-2">
										<Wind className="h-4 w-4 text-[#00ddff]" />
										<span className="text-[#9900ff]">Wind:</span>
										<span>
											{campaignData.windSpeed} {campaignData.windDirection}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<Sun className="h-4 w-4 text-[#00ddff]" />
										<span className="text-[#9900ff]">Temp:</span>
										<span>{campaignData.temperature}</span>
									</div>
									<div className="flex items-center gap-2">
										<Eye className="h-4 w-4 text-[#00ddff]" />
										<span className="text-[#9900ff]">Visibility:</span>
										<span>{campaignData.visibility}</span>
									</div>
									<div className="flex items-center gap-2">
										<Target className="h-4 w-4 text-[#00ddff]" />
										<span className="text-[#9900ff]">Objectives:</span>
										<span>{campaignData.objectives.length}</span>
									</div>
								</div>

								<div className="mt-4">
									<h4 className="mb-2 retro-font text-xs font-medium uppercase text-[#00ddff]">Primary Objectives</h4>
									<ul className="space-y-1 text-sm">
										{campaignData.objectives.map((objective, index) => (
											<li key={index} className="flex items-start gap-2">
												<span className="mt-0.5 text-xs text-[#ff00aa]">•</span>
												<span>{objective}</span>
											</li>
										))}
									</ul>
								</div>
							</CardContent>
						</Card>
						<FlightGroupList />
					</div>
				</div>
			</div>
		</div>
	);
}
