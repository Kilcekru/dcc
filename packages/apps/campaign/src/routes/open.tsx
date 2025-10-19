import { cn } from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, Clock, Shield, Skull, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Config } from "../data/config";
import { countryNameToCode } from "../domain/country";
import { campaignStore } from "../stores/campaign";
import { createCampaignStore } from "../stores/create";
import { Triggers } from "../worker";

export const Route = createFileRoute("/open")({
	component: Open,
});

function Open() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const campaignListQuery = useQuery({
		queryKey: ["campaigns"],
		queryFn: async () => {
			const list = await rpc.campaign.loadCampaignList();
			return Object.values(list).sort((a, b) => new Date(b.edited).getTime() - new Date(a.edited).getTime());
		},
	});

	React.useEffect(() => {
		if (campaignListQuery.isSuccess && campaignListQuery.data.length === 0) {
			void navigate({ to: "/create/scenario" });
		}
	}, [campaignListQuery.isSuccess, campaignListQuery.data, navigate]);

	const openCampaignMutation = useMutation({
		mutationFn: async (synopsis: Types.Campaign.CampaignSynopsis) => {
			const loadedState = await rpc.campaign.openCampaign(synopsis.id);
			if (loadedState == null) {
				return;
			}

			campaignStore.trigger.reset();
			Triggers.load({ ...loadedState });
			createCampaignStore.trigger.setScenario({ scenario: null });
		},
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			void navigate({ to: "/home" });
		},
	});

	const removeCampaignMutation = useMutation({
		mutationFn: async (id: string) => {
			await rpc.campaign.removeCampaign(id);
		},
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
		},
	});

	const incompatibleCampaigns = React.useMemo(() => {
		return new Set(
			campaignListQuery.data
				?.filter((campaign) => (campaign.version ?? 0) < Config.campaignVersion)
				.map((campaign) => campaign.id) ?? [],
		);
	}, [campaignListQuery.data]);

	const handleCampaignOpen = React.useCallback(
		(synopsis: Types.Campaign.CampaignSynopsis) => {
			if (incompatibleCampaigns.has(synopsis.id)) {
				return;
			}

			openCampaignMutation.mutate(synopsis);
		},
		[incompatibleCampaigns, openCampaignMutation],
	);

	const renderCampaignCard = (synopsis: Types.Campaign.CampaignSynopsis, index: number) => {
		const incompatible = incompatibleCampaigns.has(synopsis.id);
		const isActive = synopsis.active;
		const factionCountry = synopsis.countryName ?? "USA";
		// const opponentCountry = synopsis.opponentCountryName ?? null;
		const flagBasePath = "./assets/flags/4x3";
		const factionFlagCode = countryNameToCode(factionCountry);
		// const opponentFlagCode = opponentCountry != null ? countryNameToCode(opponentCountry) : null;
		const factionFlagSrc = `${flagBasePath}/${factionFlagCode}.svg`;
		// const opponentFlagSrc = opponentFlagCode != null ? `${flagBasePath}/${opponentFlagCode}.svg` : null;

		return (
			<motion.div
				key={synopsis.id}
				initial={{ y: 15, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.3, delay: index * 0.08 }}
			>
				<Card
					className={cn(
						"group relative flex h-full flex-col overflow-hidden border-[#9900ff]/30 bg-[#0b0014]/80 transition-all duration-300 hover:border-[#ff00aa]/50 hover:shadow-[0_0_20px_rgba(255,0,170,0.3)]",
						incompatible && "pointer-events-none opacity-60",
						isActive && "border-[#00ddff]/50 shadow-[0_0_25px_rgba(0,221,255,0.4)]",
					)}
					onClick={() => handleCampaignOpen(synopsis)}
				>
					<div className="relative h-40 w-full overflow-hidden">
						<div
							className="absolute inset-0 bg-gradient-to-br from-[#0b0014] via-[#120024] to-[#300046] transition-transform duration-700 group-hover:scale-110"
							style={{ backgroundImage: "linear-gradient(135deg, rgba(255,0,170,0.15) 0%, rgba(0,221,255,0.15) 100%)" }}
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-[#0b0014] to-transparent" />
						{isActive ? (
							<div className="absolute left-0 top-0 h-full w-1 bg-[#00ddff]" />
						) : (
							<div className="absolute left-0 top-0 h-full w-1 bg-[#ff00aa]/50 opacity-0 transition-opacity group-hover:opacity-100" />
						)}
					</div>

					<div className="flex flex-1 flex-col gap-4 p-5">
						<div className="flex items-start justify-between gap-3">
							<div>
								<h3 className="retro-font text-lg font-bold text-white">{synopsis.name}</h3>
								<div className="mt-4 flex items-center gap-4">
									<div className="h-12 w-20 overflow-hidden rounded border border-[#9900ff]/30">
										<img
											src={factionFlagSrc}
											alt={`${synopsis.factionName || "Unknown"} flag`}
											className="h-full w-full object-cover"
										/>
									</div>
									<div>
										<p className="retro-font text-lg font-bold text-white">
											{synopsis.factionName ?? "Unknown Faction"}
										</p>
									</div>
								</div>
							</div>
							<div
								onClick={(event) => {
									event.stopPropagation();
								}}
							>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="outline"
											size="icon"
											className="h-8 w-8 border-[#ff00aa]/50 bg-[#0b0014]/80 text-[#ff00aa] hover:bg-[#ff00aa]/20"
											disabled={removeCampaignMutation.isPending}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent
										className="w-56 border-[#9900ff]/30 bg-[#0b0014]/80 text-[#e0e0ff] shadow-[0_0_30px_rgba(255,0,170,0.35)] rounded-xl"
										style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
									>
										<AlertDialogHeader>
											<AlertDialogTitle className="retro-font text-lg font-bold text-white">
												Confirm Delete
											</AlertDialogTitle>
											<AlertDialogDescription className="text-[#c3b3ff]">
												Remove campaign <span className="text-[#ff00aa]">{synopsis.name}</span>? This action cannot be
												undone.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel
												className="border-[#ff00aa]/50 bg-transparent text-[#ff00aa] hover:bg-[#ff00aa]/10"
												disabled={removeCampaignMutation.isPending}
											>
												Cancel
											</AlertDialogCancel>
											<AlertDialogAction
												className="bg-gradient-to-r from-[#ff00aa] to-[#9900ff] text-white hover:from-[#ff00aa]/90 hover:to-[#9900ff]/90"
												onClick={() => {
													removeCampaignMutation.mutate(synopsis.id);
												}}
												disabled={removeCampaignMutation.isPending}
											>
												{removeCampaignMutation.isPending ? "Deleting..." : "Delete"}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>

						<div className="space-y-2 text-sm text-[#e0e0ff]">
							<div className="flex items-center gap-2">
								<Shield className="h-4 w-4 text-[#00ddff]" />
								<span className="text-[#9900ff]">Status:</span>
								<span>{isActive ? "Active" : "Available"}</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-[#00ddff]" />
								<span className="text-[#9900ff]">Time in Theatre:</span>
								<span>{Utils.Format.formatTime(synopsis.time)} hrs</span>
							</div>
							<div className="flex items-center gap-2">
								<CalendarClock className="h-4 w-4 text-[#00ddff]" />
								<span className="text-[#9900ff]">Last Sortie:</span>
								<span>{Utils.Format.formatDateTime(synopsis.edited)}</span>
							</div>
						</div>

						<div
							className={cn(
								"mt-auto h-1 w-full transition-all duration-300",
								isActive
									? "bg-gradient-to-r from-[#00ddff] via-[#ff00aa] to-[#9900ff]"
									: "bg-gradient-to-r from-[#ff00aa]/60 to-[#9900ff]/60",
							)}
						/>

						{incompatible ? (
							<div className="absolute inset-0 flex items-center justify-center bg-[#0b0014]/80">
								<p className="retro-font text-sm uppercase tracking-[0.3em] text-[#ff00aa]">Incompatible Version</p>
							</div>
						) : null}
					</div>
				</Card>
			</motion.div>
		);
	};

	return (
		<div className="relative min-h-screen w-full bg-[#0b0014] text-[#e0e0ff]">
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
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8 border-[#ff00aa]/50 bg-[#0b0014]/80 text-[#ff00aa] hover:bg-[#ff00aa]/20"
							onClick={() => {
								void rpc.misc.loadApp("home");
							}}
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<h1 className="retro-font text-xl font-medium text-[#00ddff]">
							<span className="text-[#ff00aa]">OPEN</span> CAMPAIGN
						</h1>
					</div>
					<Button
						variant="outline"
						className="border-[#ff00aa]/50 bg-[#0b0014]/80 text-[#ff00aa] hover:bg-[#ff00aa]/20"
						onClick={() => {
							createCampaignStore.trigger.setScenario({ scenario: null });
							void navigate({ to: "/create/scenario" });
						}}
					>
						<span className="retro-font">CREATE NEW CAMPAIGN</span>
					</Button>
				</div>
			</header>

			<main className="relative z-10 flex min-h-[calc(100vh-64px)] w-full flex-col px-4 py-8">
				<div className="container grid gap-8 lg:grid-cols-[2fr_1fr]">
					<section>
						<div className="mb-6">
							<h2 className="retro-font text-2xl font-bold text-white">Saved Campaigns</h2>
							<p className="text-sm text-[#9900ff]">
								Manage your operations and resume from the battlefield at any time.
							</p>
						</div>

						<div>
							{campaignListQuery.isLoading ? (
								<div className="flex h-40 items-center justify-center text-[#9900ff]">Scanning hangars...</div>
							) : campaignListQuery.isError ? (
								<div className="flex h-40 items-center justify-center text-[#ff00aa]">Unable to load campaigns.</div>
							) : campaignListQuery.data?.length === 0 ? (
								<div className="flex h-40 flex-col items-center justify-center gap-2 text-[#9900ff]">
									<Skull className="h-6 w-6" />
									<p>No campaign data detected.</p>
									<Button
										className="bg-gradient-to-r from-[#ff00aa] to-[#9900ff] text-white"
										onClick={() => void navigate({ to: "/create/scenario" })}
									>
										New Campaign
									</Button>
								</div>
							) : (
								<ScrollArea className="h-[calc(100vh-240px)] pr-4">
									<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
										{campaignListQuery.data?.map((synopsis, index) => renderCampaignCard(synopsis, index))}
									</div>
								</ScrollArea>
							)}
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}
