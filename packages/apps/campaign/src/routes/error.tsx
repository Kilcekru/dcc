import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";

export const Route = createFileRoute("/error")({
	component: Error,
});

function Error() {
	return (
		<div className="p-2">
			<h3>Error!</h3>
		</div>
	);
}
