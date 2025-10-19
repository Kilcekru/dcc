import * as DcsJs from "@foxdelta2/dcsjs";
import { cn } from "@kilcekru/dcc-lib-components";
import * as Utils from "@kilcekru/dcc-shared-utils";
import {
	AlertTriangle,
	ArrowLeft,
	Check,
	ChevronRight,
	Crosshair,
	Flag,
	LifeBuoy,
	Radar,
	Send,
	Shield,
	Target,
	Zap,
} from "lucide-react";
import React from "react";
import { useState } from "react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Link } from "../../components/ui/link";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

const aircrafts = Object.values(DcsJs.aircraftDefinitions).sort((a, b) =>
	Utils.Sort.String.asc(a.display_name, b.display_name),
);

interface Role {
	id: string;
	name: string;
	description: string;
	icon: React.ElementType;
	color: string;
}

export function CustomFaction() {
	const [factionName, setFactionName] = useState("");
	const [selectedTab, setSelectedTab] = useState("CAS");
	const [selectedAircraft, setSelectedAircraft] = useState<Record<string, string[]>>({
		cas: [],
		cap: [],
		strike: [],
		recon: [],
		transport: [],
	});

	// Mock data for roles
	const roles: Role[] = [
		{
			id: "CAS",
			name: "CLOSE AIR SUPPORT",
			description: "Aircraft specialized in supporting ground troops with precision strikes against enemy forces.",
			icon: Target,
			color: "#ff00aa",
		},
		{
			id: "CAP",
			name: "COMBAT AIR PATROL",
			description: "Air superiority fighters that establish and maintain air dominance over the battlefield.",
			icon: Shield,
			color: "#00ddff",
		},
		{
			id: "Pinpoint Strike",
			name: "STRIKE",
			description: "Aircraft designed for precision bombing of strategic targets deep behind enemy lines.",
			icon: Zap,
			color: "#ffcc00",
		},
		{
			id: "SEAD",
			name: "SEAD",
			description: "Aircraft designed to suppress and destroy enemy air defenses.",
			icon: AlertTriangle,
			color: "#9900ff",
		},
		{
			id: "DEAD",
			name: "DEAD",
			description: "Aircraft designed to destroy enemy air defenses.",
			icon: Crosshair,
			color: "#00ffaa",
		},
		{
			id: "Air Assault",
			name: "AIR ASSAULT",
			description: "Helicopters designed to transport and deploy troops and equipment into combat zones.",
			icon: Send,
			color: "#ff8800",
		},
		{
			id: "CSAR",
			name: "CSAR",
			description:
				"Aircraft specialized in locating and rescuing downed aircrew and other personnel in hostile environments.",
			icon: LifeBuoy,
			color: "#00ff88",
		},
		{
			id: "AWACS",
			name: "AWACS",
			description:
				"Aircraft equipped with radar and other sensors to provide all-weather surveillance, command, control, and communications.",
			icon: Radar,
			color: "#00aaff",
		},
	];

	const toggleAircraftSelection = (roleId: string, aircraftId: string) => {
		setSelectedAircraft((prev) => {
			const currentSelections = [...(prev[roleId] ?? [])];

			if (currentSelections.includes(aircraftId)) {
				return {
					...prev,
					[roleId]: currentSelections.filter((id) => id !== aircraftId),
				};
			} else {
				return {
					...prev,
					[roleId]: [...currentSelections, aircraftId],
				};
			}
		});
	};

	const getAircraftForRole = (roleId: string) => {
		return aircrafts.filter((a) => a.availableTasks.find((task) => task === roleId));
	};

	const isFormValid = () => {
		return factionName.trim() !== "" && Object.values(selectedAircraft).some((selections) => selections.length > 0);
	};

	return (
		<div className="relative flex min-h-screen w-full flex-col bg-[#0b0014]">
			<div className="absolute inset-0 z-0 bg-cover opacity-20" />
			<div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-[#ff00aa] via-[#9900ff] to-transparent opacity-30" />
			<div
				className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
				style={{
					backgroundImage:
						"linear-gradient(to right, #ff00aa 1px, transparent 1px), linear-gradient(to bottom, #ff00aa 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>
			<header className="relative z-10 border-b border-[#ff00aa]/30 bg-[#0b0014]/90 px-4 py-4">
				<div className="container flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Link to="create/faction">
							<Button
								variant="outline"
								size="icon"
								className="h-8 w-8 border-[#ff00aa]/50 bg-[#0b0014]/80 text-[#ff00aa] hover:bg-[#ff00aa]/20"
							>
								<ArrowLeft className="h-4 w-4" />
							</Button>
						</Link>
						<h1 className="retro-font text-xl font-medium text-[#00ddff]">
							<span className="text-[#ff00aa]">CREATE</span> CUSTOM FACTION
						</h1>
					</div>
				</div>
			</header>
			<ScrollArea className="h-[calc(100vh)]">
				<main className="relative z-10 flex-1 px-4 py-8">
					<div className="container">
						<div className="mb-8 max-w-2xl">
							<h2 className="retro-font mb-2 text-2xl font-bold text-white">Design Your Air Force</h2>
							<p className="text-[#9900ff]">Create a custom faction by selecting aircraft for each combat role.</p>
						</div>
						<div className="mb-8">
							<label className="retro-font mb-2 block text-sm font-medium text-[#00ddff]">FACTION NAME</label>
							<div className="flex gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-md border border-[#ff00aa]/30 bg-[#0b0014]/80">
									<Flag className="h-6 w-6 text-[#ff00aa]" />
								</div>
								<Input
									value={factionName}
									onChange={(e) => setFactionName(e.target.value)}
									className="retro-font h-12 flex-1 border-[#ff00aa]/30 bg-[#0b0014]/80 text-lg text-[#e0e0ff] focus:border-[#ff00aa] focus:ring-[#ff00aa]/20"
									placeholder="Enter faction name"
								/>
							</div>
						</div>
						<Card className="mb-8 border-[#ff00aa]/30 bg-[#0b0014]/80 shadow-[0_0_15px_rgba(255,0,170,0.2)]">
							<CardHeader className="pb-2">
								<CardTitle className="retro-font text-xl text-white">
									<span className="text-[#ff00aa]">ASSIGN</span> AIRCRAFT TO ROLES
								</CardTitle>
							</CardHeader>
							<CardContent>
								<Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
									<TabsList className="mb-4 grid w-full auto-rows-min gap-2 bg-[#0b0014] sm:grid-cols-3 lg:grid-cols-5 h-[4rem]">
										{roles.map((role) => (
											<TabsTrigger
												key={role.id}
												value={role.id}
												className={cn("flex items-center gap-1.5 data-[state=active]:bg-[#0b0014]")}
												style={{
													borderColor: selectedTab === role.id ? role.color : "transparent",
													boxShadow: selectedTab === role.id ? `0 0 10px ${role.color}40` : "none",
												}}
											>
												<role.icon className="h-4 min-w-4" />
												<span className="hidden sm:inline">{role.name}</span>
												<span className="inline sm:hidden">{role.id.toUpperCase()}</span>
												{(selectedAircraft?.[role.id]?.length ?? 0) > 0 && (
													<Badge className="ml-1 bg-[#ff00aa]/20 text-[#ff00aa]">
														{selectedAircraft?.[role.id]?.length}
													</Badge>
												)}
											</TabsTrigger>
										))}
									</TabsList>

									{roles.map((role) => (
										<TabsContent key={role.id} value={role.id} className="space-y-4">
											<div className="flex items-center gap-3">
												<role.icon className="h-5 w-5" style={{ color: role.color }} />
												<h3 className="retro-font text-lg font-medium text-white">{role.name}</h3>
											</div>
											<p className="text-sm text-[#9900ff]">{role.description}</p>
											<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
												{getAircraftForRole(role.id).map((aircraft) => (
													<div
														key={aircraft.name}
														className={cn(
															"group relative cursor-pointer overflow-hidden rounded-md border border-[#9900ff]/30 bg-[#0b0014]/80 p-4 transition-all duration-300 hover:border-[#ff00aa]/50",
															selectedAircraft?.[role.id]?.includes(aircraft.name) &&
																"border-[#ff00aa] shadow-[0_0_15px_rgba(255,0,170,0.3)]",
														)}
														onClick={() => toggleAircraftSelection(role.id, aircraft.name)}
													>
														{/* Selected indicator */}
														{selectedAircraft?.[role.id]?.includes(aircraft.name) && (
															<div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#ff00aa]">
																<Check className="h-4 w-4 text-white" />
															</div>
														)}

														<div className="mb-3 flex items-center gap-3">
															<div>
																<h4 className="retro-font font-medium text-white">{aircraft.display_name}</h4>
																<div className="flex gap-2">
																	<Badge className="mt-1 bg-[#9900ff]/10 text-[#9900ff]">{aircraft.era}</Badge>
																	{aircraft.isMod ? (
																		<Badge className="mt-1 bg-pink-600/10 text-pink-600">Mod</Badge>
																	) : null}
																	{aircraft.isHelicopter ? (
																		<Badge className="mt-1 bg-green-600/10 text-green-600">Helicopter</Badge>
																	) : null}
																	{!aircraft.controllable && (
																		<Badge className="mt-1 bg-red-600/10 text-red-600">AI</Badge>
																	)}
																</div>
															</div>
														</div>
													</div>
												))}
											</div>
											{getAircraftForRole(role.id).length === 0 && (
												<div className="flex h-32 items-center justify-center rounded-md border border-dashed border-[#9900ff]/30 bg-[#0b0014]/50">
													<p className="text-[#9900ff]">No aircraft available for this role</p>
												</div>
											)}
										</TabsContent>
									))}
								</Tabs>
							</CardContent>
						</Card>
						<Card className="mb-8 border-[#ff00aa]/30 bg-[#0b0014]/80 shadow-[0_0_15px_rgba(255,0,170,0.2)]">
							<CardHeader className="pb-2">
								<CardTitle className="retro-font text-xl text-white">
									<span className="text-[#ff00aa]">FACTION</span> SUMMARY
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{roles.map((role) => (
										<div key={role.id} className="rounded-md border border-[#9900ff]/20 bg-[#0b0014]/50 p-3">
											<div className="mb-2 flex items-center gap-2">
												<role.icon className="h-4 w-4" style={{ color: role.color }} />
												<h4 className="retro-font text-sm font-medium text-white">{role.name}</h4>
												<Badge className="ml-auto bg-[#ff00aa]/10 text-[#ff00aa]">
													{selectedAircraft?.[role.id]?.length} Selected
												</Badge>
											</div>

											{(selectedAircraft?.[role.id]?.length ?? 0) > 0 ? (
												<div className="flex flex-wrap gap-2">
													{selectedAircraft[role.id]?.map((aircraftId) => {
														const aircraftData = aircrafts?.find((a) => a.name === aircraftId);
														return (
															<Badge key={aircraftId} className="bg-[#0b0014] text-[#e0e0ff]">
																{aircraftData?.display_name}
															</Badge>
														);
													})}
												</div>
											) : (
												<p className="text-xs text-[#9900ff]">No aircraft assigned</p>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
						<div className="mt-8 flex justify-between">
							<Link to="create/faction">
								<Button
									variant="outline"
									className="retro-font border-[#ff00aa]/30 bg-[#0b0014]/80 text-[#00ddff] hover:bg-[#ff00aa]/10 hover:text-white"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									BACK
								</Button>
							</Link>

							<Button
								className="group relative flex items-center gap-2 bg-gradient-to-r from-[#ff00aa] to-[#9900ff] px-8 py-6 text-lg font-medium text-white hover:from-[#ff00aa]/90 hover:to-[#9900ff]/90"
								disabled={!isFormValid()}
							>
								<span className="retro-font">CREATE FACTION</span>
								<ChevronRight className="h-5 w-5" />
								<span className="absolute inset-0 blur-[10px] bg-[#ff00aa]/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
							</Button>
						</div>
					</div>
				</main>
			</ScrollArea>
			<footer className="relative z-10 border-t border-[#ff00aa]/30 bg-[#0b0014]/90 px-4 py-3">
				<div className="container flex items-center justify-between">
					<p className="retro-font text-xs text-[#9900ff]">
						AIRCRAFT AVAILABLE: {aircrafts.length} / ROLES: {roles.length}
					</p>
				</div>
			</footer>
		</div>
	);
}
