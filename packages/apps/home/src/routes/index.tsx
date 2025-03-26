import { createFileRoute } from "@tanstack/react-router";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { Button, cn } from "@kilcekru/dcc-lib-components";
import * as React from "react";
import { motion } from "motion/react";
import { LogOut, Settings } from "lucide-react";
import { BookOpen, Plane } from "lucide-react";
import { useState } from "react";
import f14 from "../assets/index.png";

type App = {
	name: string;
	id: string;
	available: boolean;
	description: string;
};
/* const menuOptions: Array<App> = [
    {
        name: "Dynamic Campaign",
        id: "campaign",
        available: true,
        description: "Create and fly your own Campaign",
    },
    {
        name: "Quick Mission",
        id: "mission",
        available: false,
        description: "Create your own Mission in seconds",
    },
    {
        name: "Patcher",
        id: "patcher",
        available: false,
        description: "Perform Updates and Fixes",
    },
]; */

const menuOptions = [
	{ id: "campaign", label: "DYNAMIC CAMPAIGN", icon: BookOpen },
	{ id: "quickMission", label: "QUICK MISSION", icon: Plane },
	{ id: "settings", label: "SETTINGS", icon: Settings },
	{ id: "exit", label: "EXIT", icon: LogOut },
];

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const [selectedOption, setSelectedOption] = useState<string | null>(null);

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
			<div className="relative z-10 flex w-full max-w-6xl flex-col items-start px-8">
				{/* Game title with neon effect */}
				<motion.div
					className="mb-12 flex flex-col"
					initial={{ y: -50, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					<h1 className="retro-font text-6xl font-bold tracking-tighter text-white md:text-7xl lg:text-8xl">
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff00aa] to-[#00ddff]">DIGITAL</span>
						<span className="ml-3 relative">
							CREW CHIEF
							<span className="absolute inset-0 blur-[10px] text-[#ff00aa] opacity-70">CREW CHIEF</span>
						</span>
					</h1>
					<h2 className="pixel-font text-lg text-[#00ddff] md:text-xl">
						100% FLYING, 0% CONFIGURATION.
						<span className="ml-2 inline-block h-5 w-2 animate-pulse bg-[#00ddff]"></span>
					</h2>
				</motion.div>

				{/* Menu options with neon glow */}
				<div className="flex w-full max-w-md flex-col space-y-3">
					{menuOptions.map((option, index) => (
						<motion.div
							key={option.id}
							initial={{ x: -50, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
						>
							<Button
								variant={selectedOption === option.id ? "default" : "outline"}
								className={cn(
									"group relative flex w-full justify-start gap-3 border-l-4 px-4 py-6 text-left retro-font text-xl transition-all",
									selectedOption === option.id
										? "border-[#ff00aa] bg-[#ff00aa]/10 text-white hover:bg-[#ff00aa]/20"
										: "border-[#9900ff] bg-[#0b0014]/80 text-[#00ddff] hover:border-[#ff00aa] hover:bg-[#9900ff]/10 hover:text-white",
								)}
								onClick={() => {
									setSelectedOption(option.id);
									window.setTimeout(() => {
										void rpc.misc.loadApp(option.id as "campaign");
									}, 200);
								}}
							>
								<option.icon
									className={cn(
										"h-5 w-5 transition-colors",
										selectedOption === option.id ? "text-[#ff00aa]" : "text-[#00ddff] group-hover:text-[#ff00aa]",
									)}
								/>
								{option.label}
								{selectedOption === option.id && (
									<span className="absolute inset-0 blur-[20px] bg-[#ff00aa]/20 opacity-70"></span>
								)}
							</Button>
						</motion.div>
					))}
				</div>

				{/* Retro aircraft silhouette with neon outline */}
				<motion.div
					className="absolute bottom-0 right-0 h-[450px] w-[360px]"
					style={{
						filter: "drop-shadow(0 0 10px #ff00aa)",
					}}
					initial={{ x: 100, opacity: 0 }}
					animate={{ x: 0, opacity: 0.6 }}
					transition={{ duration: 1, delay: 0.5 }}
				>
					<img src={f14} alt="F-14 Tomcat" className="w-full h-full object-center object-cover" />
				</motion.div>
			</div>
		</div>
	);
	/*  return (
        <div className="p-2 flex flex-col gap-2 items-center justify-center w-full flex-1">
            <h1 className='text-2xl font-bold'>Digital Crew Chief</h1>
                {appList.map((app) => (
                    <button key={app.id} className={cn('w-96 bg-gray-800 rounded-lg p-4', {
                        "opacity-50": !app.available
                    })} onClick={() => {
                        if (!app.available) return;
                        void rpc.misc.loadApp(app.id as "campaign");
                    }}>
                        <h2>{app.name}</h2>
                        <p className='text-sm opacity-60'>{app.description}</p>
                    </button>
                ))}
            </div>
            ) */
}
