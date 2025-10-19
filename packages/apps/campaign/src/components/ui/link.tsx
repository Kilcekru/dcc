import { cn } from "@kilcekru/dcc-lib-components";
import { Slot } from "@radix-ui/react-slot";
import React from "react";

import { RoutePath } from "../../router";
import { routerStore } from "../../stores/router";

export function Link({
	to,
	children,
	asChild = false,
	className,
	disabled = false,
	onClick,
}: {
	to: RoutePath;
	children: React.ReactNode;
	asChild?: boolean;
	className?: string;
	disabled?: boolean;
	onClick?: () => void | Promise<() => void>;
}) {
	const handleClick = () => {
		if (disabled) return;
		routerStore.trigger.push({ path: to });
		void onClick?.();
	};

	const Comp = asChild ? Slot : "div";

	return (
		<Comp onClick={handleClick} className={cn("link", className)}>
			{children}
		</Comp>
	);
}
