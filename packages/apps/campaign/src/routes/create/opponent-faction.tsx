import { cn } from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSelector } from "@xstate/store/react";
import { ArrowLeft, ChevronRight, Plane, Plus } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
import { countryNameToCode } from "../../domain/country";
import { factionList } from "../../domain/faction";
import { createCampaignStore } from "../../stores/create";
import { sendWorkerMessage } from "../../worker";

export const Route = createFileRoute("/create/opponent-faction")({
	component: OpponentFaction,
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

function OpponentFaction() {
	const selectedFaction = useSelector(createCampaignStore, (state) => state.context.faction);
	const scenario = useSelector(createCampaignStore, (state) => state.context.scenario);
	const selectedOpponentFaction = useSelector(createCampaignStore, (state) => state.context.oponentFaction);
	const factionsQuery = useQuery({
		queryKey: ["factions"],
		queryFn: factionList,
	});
	const navigate = useNavigate();

	const handleConfirmSelection = async () => {
		if (selectedFaction == null || scenario == null || selectedOpponentFaction == null) {
			return;
		}

		sendWorkerMessage({
			name: "generate",
			payload: {
				blueFactionDefinition: selectedFaction,
				redFactionDefinition: selectedOpponentFaction,
				scenario: scenario,
				campaignParams: {
					aiSkill: "Average",
					badWeather: false,
					hardcore: false,
					hotStart: false,
					nightMissions: false,
					samActive: "activeNoRepair",
					shoradLevel: "normal",
					training: false,
				},
			},
		});
		sendWorkerMessage({
			name: "serialize",
		});
		void navigate({ to: "/home" });
	};

	// Filter out the already selected faction from the opponent options
	const availableFactions = factionsQuery.data?.filter((faction) => faction.id !== selectedFaction?.id) || [];

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
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8 border-[#ff00aa]/50 bg-[#0b0014]/80 text-[#ff00aa] hover:bg-[#ff00aa]/20"
							onClick={() => (window.location.hash = "#/create/faction")}
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<h1 className="retro-font text-xl font-medium text-[#00ddff]">
							<span className="text-[#ff00aa]">SELECT</span> OPPONENT FACTION
						</h1>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="relative z-10 flex-1 px-4 py-8 flex justify-center items-center overflow-hidden">
				<div className="container">
					<div className="mb-8 max-w-2xl">
						<h2 className="retro-font mb-2 text-2xl font-bold text-white">Choose Your Opponent</h2>
						<p className="text-[#9900ff]">Select the faction that will oppose your {selectedFaction?.name} forces.</p>
					</div>

					{/* Create custom faction button */}
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.3 }}
						className="mb-6"
					>
						<Button
							variant="outline"
							className="group relative flex w-full items-center justify-center gap-2 border-dashed border-[#ff00aa]/50 bg-[#0b0014]/80 py-6 text-[#ff00aa] hover:border-[#ff00aa] hover:bg-[#ff00aa]/10"
							onClick={() => (window.location.hash = "#/create/custom-opponent-faction")}
						>
							<Plus className="h-5 w-5" />
							<span className="retro-font text-lg">CREATE CUSTOM OPPONENT FACTION</span>
							<span className="absolute inset-0 blur-[10px] bg-[#ff00aa]/10 opacity-0 transition-opacity group-hover:opacity-100"></span>
						</Button>
					</motion.div>

					{/* Faction selection */}
					<ScrollArea className="h-[calc(100vh-400px)]">
						<div className="grid gap-6 md:grid-cols-2">
							{!factionsQuery.isSuccess || availableFactions.length === 0
								? null
								: availableFactions.map((faction, index) => (
										<motion.div
											key={faction.id}
											initial={{ y: 20, opacity: 0 }}
											animate={{ y: 0, opacity: 1 }}
											transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
											onClick={() => createCampaignStore.trigger.setOponentFaction({ faction })}
										>
											<Card
												className={cn(
													"group relative cursor-pointer overflow-hidden border-[#9900ff]/30 bg-[#0b0014]/80 transition-all duration-300 hover:border-[#ff00aa]/50 hover:shadow-[0_0_20px_rgba(255,0,170,0.3)]",
													selectedOpponentFaction?.id === faction.id &&
														"border-[#ff00aa] shadow-[0_0_30px_rgba(255,0,170,0.4)]",
												)}
											>
												{/* Selected indicator */}
												{selectedOpponentFaction?.id === faction.id && (
													<div className="absolute left-0 top-0 h-full w-1" />
												)}

												{/* Faction content */}
												<div className="p-5">
													<div className="mb-4 flex items-center gap-4">
														<div className="h-12 w-20 overflow-hidden rounded border border-[#9900ff]/30">
															<img
																src={`./assets/flags/4x3/${countryNameToCode(faction.countryName)}.svg`}
																alt={faction.name}
																className="h-full w-full object-cover"
															/>
														</div>
														<div>
															<h3 className="retro-font text-lg font-bold text-white">{faction.name}</h3>
															<p className="text-sm text-[#00ddff]">{faction.year}</p>
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
															selectedOpponentFaction?.id === faction.id
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
							onClick={handleConfirmSelection}
							className="group relative flex items-center gap-2 bg-gradient-to-r from-[#ff00aa] to-[#9900ff] px-8 py-6 text-lg font-medium text-white hover:from-[#ff00aa]/90 hover:to-[#9900ff]/90"
							disabled={!selectedOpponentFaction}
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
