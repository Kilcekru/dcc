import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, ChevronRight, Plus, Plane, Shield } from "lucide-react";
import { cn } from "@kilcekru/dcc-lib-components";
import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";
import { factionList } from "../../domain/faction";
import { useQuery } from "@tanstack/react-query";
import * as Types from "@kilcekru/dcc-shared-types";
import { ScrollArea } from "../../components/ui/scroll-area";
import { countryNameToCode } from "../../domain/country";

export const Route = createFileRoute("/create/faction")({
	component: Faction,
});

function getFactionAircrafts(faction: Types.Campaign.Faction) {
	const aircrafts = new Set<string>();

	for (const aircraftType of Object.values(faction.aircraftTypes)) {
		for (const aircraft of aircraftType) {
			aircrafts.add(aircraft);
		}
	}

	return Array.from(aircrafts);
}

function Faction() {
	const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
	const factionsQuery = useQuery({
		queryKey: ["factions"],
		queryFn: factionList,
	});

	const getEraColor = (era: string) => {
		switch (era) {
			case "Cold War":
				return "bg-[#9900ff]/10 text-[#9900ff]";
			case "Modern":
				return "bg-[#00ddff]/10 text-[#00ddff]";
			case "Near Future":
				return "bg-[#00ffaa]/10 text-[#00ffaa]";
			default:
				return "bg-gray-100/10 text-gray-500";
		}
	};

	return (
		<div className="relative flex min-h-screen w-full flex-col bg-[#0b0014]">
			{/* Grid background */}
			<div className="absolute inset-0 z-0 bg-cover opacity-20" />

			{/* Synthwave sun/horizon effect */}
			<div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-[#ff00aa] via-[#9900ff] to-transparent opacity-30" />

			{/* Animated grid lines */}
			<div
				className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
				style={{
					backgroundImage:
						"linear-gradient(to right, #ff00aa 1px, transparent 1px), linear-gradient(to bottom, #ff00aa 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>

			{/* Header */}
			<header className="relative z-10 border-b border-[#ff00aa]/30 bg-[#0b0014]/90 px-4 py-4">
				<div className="container flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Link to="/create/scenario">
							<Button
								variant="outline"
								size="icon"
								className="h-8 w-8 border-[#ff00aa]/50 bg-[#0b0014]/80 text-[#ff00aa] hover:bg-[#ff00aa]/20"
							>
								<ArrowLeft className="h-4 w-4" />
							</Button>
						</Link>
						<h1 className="retro-font text-xl font-medium text-[#00ddff]">
							<span className="text-[#ff00aa]">SELECT</span> FACTION
						</h1>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="relative z-10 flex-1 px-4 py-8 flex justify-center items-center overflow-hidden">
				<div className="container">
					<div className="mb-8 max-w-2xl">
						<h2 className="retro-font mb-2 text-2xl font-bold text-white">Choose Your Faction</h2>
						<p className="text-[#9900ff]">Select a faction to command or create your own custom air force.</p>
					</div>

					{/* Create custom faction button */}
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.3 }}
						className="mb-6"
					>
						<Link to="/create/custom-faction">
							<Button
								variant="outline"
								className="group relative flex w-full items-center justify-center gap-2 border-dashed border-[#ff00aa]/50 bg-[#0b0014]/80 py-6 text-[#ff00aa] hover:border-[#ff00aa] hover:bg-[#ff00aa]/10"
							>
								<Plus className="h-5 w-5" />
								<span className="retro-font text-lg">CREATE CUSTOM FACTION</span>
								<span className="absolute inset-0 blur-[10px] bg-[#ff00aa]/10 opacity-0 transition-opacity group-hover:opacity-100"></span>
							</Button>
						</Link>
					</motion.div>

					{/* Faction selection */}
					<ScrollArea className="h-[500px]">
						<div className="grid gap-6 md:grid-cols-2">
							{!factionsQuery.isSuccess || factionsQuery.data == null
								? null
								: factionsQuery.data.map((faction, index) => (
										<motion.div
											key={index}
											initial={{ y: 20, opacity: 0 }}
											animate={{ y: 0, opacity: 1 }}
											transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
											onClick={() => setSelectedFaction(faction.name)}
										>
											<Card
												className={cn(
													"group relative cursor-pointer overflow-hidden border-[#9900ff]/30 bg-[#0b0014]/80 transition-all duration-300 hover:border-[#ff00aa]/50 hover:shadow-[0_0_20px_rgba(255,0,170,0.3)]",
													selectedFaction === faction.name && "border-[#ff00aa] shadow-[0_0_30px_rgba(255,0,170,0.4)]",
												)}
											>
												{/* Selected indicator */}
												{selectedFaction === faction.name && <div className="absolute left-0 top-0 h-full w-1" />}

												{/* Faction content */}
												<div className="p-5">
													<div className="mb-4 flex items-center gap-4">
														<div className="h-12 w-20 overflow-hidden rounded border border-[#9900ff]/30">
															<img
																src={`./assets/${countryNameToCode(faction.countryName)}.png`}
																alt={faction.name}
																className="h-full w-full object-cover"
															/>
														</div>
														<div>
															<h3 className="retro-font text-lg font-bold text-white">{faction.name}</h3>
														</div>
													</div>

													{/* Aircraft list */}
													<div className="mb-4">
														<div className="mb-2 flex items-center gap-2 text-sm">
															<Plane className="h-4 w-4 text-[#00ddff]" />
															<span className="text-[#9900ff]">Available Aircraft:</span>
														</div>
														<div className="grid grid-cols-2 gap-2 text-xs">
															{getFactionAircrafts(faction).map((aircraft) => (
																<div key={aircraft} className="flex items-center gap-1.5">
																	<span className="text-[#ff00aa]">•</span>
																	<span className="text-[#e0e0ff]">{aircraft}</span>
																</div>
															))}
														</div>
													</div>

													{/* Selection indicator */}
													<div
														className={cn(
															"mt-2 h-1 w-full transition-all duration-300",
															selectedFaction === faction.name
																? "bg-gradient-to-r from-[#ff00aa] to-[#9900ff]"
																: "bg-[#9900ff]/20",
														)}
													/>
												</div>
											</Card>
										</motion.div>
									))}
						</div>
					</ScrollArea>

					{/* Action buttons */}
					<div className="mt-8 flex justify-end">
						<Button
							className="group relative flex items-center gap-2 bg-gradient-to-r from-[#ff00aa] to-[#9900ff] px-8 py-6 text-lg font-medium text-white hover:from-[#ff00aa]/90 hover:to-[#9900ff]/90"
							disabled={!selectedFaction}
						>
							<span className="retro-font">CONFIRM SELECTION</span>
							<ChevronRight className="h-5 w-5" />
							<span className="absolute inset-0 blur-[10px] bg-[#ff00aa]/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
						</Button>
					</div>
				</div>
			</main>
		</div>
	);
}
