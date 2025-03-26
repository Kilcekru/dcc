import React, { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@kilcekru/dcc-lib-components";
import { CheckCircle } from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { loadUserConfig } from "../utils";
import { userConfigStore } from "../stores/user-config";

export const Route = createFileRoute("/about")({
	component: OnboardingPage,
});

function OnboardingPage() {
	const navigate = useNavigate();

	async function completeSetup() {
		try {
			await rpc.home.setSetupComplete();
			await loadUserConfig();
			navigate({ to: "/" });
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Unknown error";
			userConfigStore.set({
				error: new Error(`onSetupComplete failed: ${msg}`),
			});
		}
	}

	return (
		<div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#0b0014]">
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

			{/* Content container */}
			<div className="relative z-10 flex w-full max-w-md flex-col items-center justify-center px-8">
				{/* Installation complete card */}
				<motion.div
					className="w-full rounded-lg border border-[#ff00aa]/30 bg-[#0b0014]/80 p-8 shadow-[0_0_30px_rgba(255,0,170,0.3)]"
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					<div className="mb-6 flex flex-col items-center text-center">
						<CheckCircle className="mb-4 h-16 w-16 text-[#00ffaa]" />
						<h1 className="retro-font mb-2 text-2xl font-bold text-white">
							<span className="text-[#ff00aa]">INSTALLATION</span> COMPLETE
						</h1>
						<div className="h-1 w-24 bg-gradient-to-r from-[#ff00aa] to-[#00ddff]"></div>
					</div>

					<div className="mb-8 space-y-4 text-center">
						<p className="retro-font text-[#e0e0ff]">Digital Crew Chief has been installed.</p>
						<p className="retro-font text-[#e0e0ff]">A shortcut to start DCC has been placed on your Desktop.</p>
						<p className="retro-font text-[#e0e0ff]">You can now delete the setup file.</p>
					</div>

					<div className="flex justify-center">
						<Button
							className="group relative w-full bg-gradient-to-r from-[#ff00aa] to-[#9900ff] px-8 py-6 text-lg font-medium text-white hover:from-[#ff00aa]/90 hover:to-[#9900ff]/90"
							onClick={completeSetup}
						>
							<span className="retro-font">CONTINUE</span>
							<span className="absolute inset-0 blur-[10px] bg-[#ff00aa]/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
						</Button>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
