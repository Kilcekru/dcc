import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { ArrowLeft, ChevronRight, Shield, Zap, Mountain, Target } from "lucide-react";
import { cn } from "@kilcekru/dcc-lib-components";
import { createFileRoute, Link } from "@tanstack/react-router";
import { scenarioList } from "../../data/scenarios";
import React from "react";

export const Route = createFileRoute("/create/scenario")({
	component: Scenario,
});

interface Campaign {
	id: string;
	name: string;
	codename: string;
	description: string;
	difficulty: "Easy" | "Medium" | "Hard";
	missions: number;
	duration: string;
	image: string;
	color: string;
}

export default function Scenario() {
	const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case "Easy":
				return "bg-[#00ffaa]/10 text-[#00ffaa]";
			case "Medium":
				return "bg-[#ffcc00]/10 text-[#ffcc00]";
			case "Hard":
				return "bg-[#ff00aa]/10 text-[#ff00aa]";
			default:
				return "bg-gray-100/10 text-gray-500";
		}
	};

	const getDifficultyStars = (difficulty: string) => {
		switch (difficulty) {
			case "Easy":
				return 1;
			case "Medium":
				return 2;
			case "Hard":
				return 3;
			default:
				return 0;
		}
	};

	const getCampaignIcon = (id: string) => {
		switch (id) {
			case "neon-horizon":
				return <Zap className="h-6 w-6" />;
			case "crimson-vortex":
				return <Target className="h-6 w-6" />;
			case "phantom-nexus":
				return <Shield className="h-6 w-6" />;
			default:
				return <Mountain className="h-6 w-6" />;
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
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8 border-[#ff00aa]/50 bg-[#0b0014]/80 text-[#ff00aa] hover:bg-[#ff00aa]/20"
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<h1 className="retro-font text-xl font-medium text-[#00ddff]">
							<span className="text-[#ff00aa]">SELECT</span> CAMPAIGN
						</h1>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="relative z-10 flex-1 px-4 py-8 flex justify-center items-center">
				<div className="container">
					<div className="mb-8 max-w-2xl">
						<h2 className="retro-font mb-2 text-2xl font-bold text-white">Available Campaigns</h2>
					</div>

					{/* Campaign selection */}
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{scenarioList.map((scenario) => (
							<motion.div
								key={scenario.id}
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.3, delay: scenarioList.indexOf(scenario) * 0.1 }}
								onClick={() => setSelectedCampaign(scenario.id)}
							>
								<Card
									className={cn(
										"group relative h-full overflow-hidden border-[#9900ff]/30 bg-[#0b0014]/80 transition-all duration-300 hover:border-[#ff00aa]/50 hover:shadow-[0_0_20px_rgba(255,0,170,0.3)]",
										selectedCampaign === scenario.id && "border-[#ff00aa] shadow-[0_0_30px_rgba(255,0,170,0.4)]",
									)}
								>
									{/* Campaign image */}
									<div className="relative h-48 w-full overflow-hidden">
										<div
											className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
											style={{ backgroundImage: `url(./assets/red-bullet.jpg)` }}
										/>
										<div
											className="absolute inset-0 bg-gradient-to-t from-[#0b0014] to-transparent"
											style={{ opacity: selectedCampaign === scenario.id ? 0.7 : 0.5 }}
										/>

										{/* Selected indicator */}
										{selectedCampaign === scenario.id && <div className="absolute left-0 top-0 h-full w-1" />}
									</div>

									{/* Campaign content */}
									<div className="p-5">
										<div className="mb-4 flex items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-full">
												{getCampaignIcon(scenario.id)}
											</div>
											<div>
												<h3 className="retro-font text-lg font-bold text-white">{scenario.name}</h3>
												<p className="text-sm text-[#9900ff]">{scenario.id}</p>
											</div>
										</div>

										<div
											className="mb-4 text-sm text-[#e0e0ff]"
											dangerouslySetInnerHTML={{ __html: scenario.briefing }}
										/>

										{/* Selection indicator */}
										<div
											className={cn(
												"mt-2 h-1 w-full transition-all duration-300",
												selectedCampaign === scenario.id
													? "bg-gradient-to-r from-[#ff00aa] to-[#9900ff]"
													: "bg-[#9900ff]/20",
											)}
										/>
									</div>
								</Card>
							</motion.div>
						))}
					</div>

					{/* Action buttons */}
					<div className="mt-8 flex justify-end">
						<Link to="/create/faction" disabled={!selectedCampaign}>
							<Button
								className="group relative flex items-center gap-2 bg-gradient-to-r from-[#ff00aa] to-[#9900ff] px-8 py-6 text-lg font-medium text-white hover:from-[#ff00aa]/90 hover:to-[#9900ff]/90"
								disabled={!selectedCampaign}
							>
								<span className="retro-font">NEXT: SELECT YOUR FACTION</span>
								<ChevronRight className="h-5 w-5" />
								<span className="absolute inset-0 blur-[10px] bg-[#ff00aa]/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
							</Button>
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}
