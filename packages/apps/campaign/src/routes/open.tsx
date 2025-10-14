import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/open")({
	component: Open,
});

function Open() {
	return (
		<div className="bg-[#0b0014] text-[#e0e0ff]">
			{/* Main content */}
			<div className="relative flex h-[calc(100vh-56px)] w-full overflow-hidden">
				{/* Map - takes most of the screen */}
				<div className="relative flex-1 overflow-hidden">
					<div className="absolute inset-0 flex flex-col overflow-hidden">
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
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
