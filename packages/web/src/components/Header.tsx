import React from "react";
import {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuTrigger,
	NavigationMenuContent,
	NavigationMenuLink,
	navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { Button } from "./ui/button";
import discord from "../images/discord.svg";
import github from "../images/github.svg";
import icon from "../images/icon-2.webp";

import { cn, discordUrl, downloadUrl } from "../lib/utils";
import { Database } from "lucide-react";

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
	({ className, title, children, ...props }, ref) => {
		return (
			<li>
				<NavigationMenuLink asChild>
					<a
						ref={ref}
						className={cn(
							"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
							className,
						)}
						{...props}
					>
						<div className="text-sm font-medium leading-none">{title}</div>
						<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
					</a>
				</NavigationMenuLink>
			</li>
		);
	},
);

export function Header() {
	return (
		<NavigationMenu className="left-0 right-0 top-0 z-10 flex h-16 w-full max-w-full justify-center bg-primary px-10 sm:justify-between">
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuLink href="/">
						<img src={icon.src} className="h-8 w-8" alt="Digital Crew Chief Logo" />
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink className={navigationMenuTriggerStyle()} href="/docs">
						Docs
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink href="/database">
						<NavigationMenuTrigger className="hidden p-0 px-0 sm:inline-flex">Database</NavigationMenuTrigger>
						<span className={cn(navigationMenuTriggerStyle(), "inline sm:hidden")}>Database</span>
					</NavigationMenuLink>
					<NavigationMenuContent>
						<ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
							<li className="row-span-3">
								<NavigationMenuLink asChild>
									<a
										className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none hover:bg-accent focus:shadow-md"
										href="/database"
									>
										<Database size={48} />
										<div className="mb-2 mt-4 text-lg font-medium">DCC Database</div>
										<p className="text-sm leading-tight text-muted-foreground">Find out what is used in DCC</p>
									</a>
								</NavigationMenuLink>
							</li>
							<ListItem href="/database/aircrafts" title="Aircrafts">
								Explore the Aircrafts in DCC
							</ListItem>
							<ListItem href="/database/pylons" title="Pylons">
								Which pylons are attached to which Aircraft
							</ListItem>
							<ListItem href="/database/weapons" title="Weapons">
								What Weapons are used in DCC
							</ListItem>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
			<NavigationMenuList className="hidden sm:flex">
				<NavigationMenuItem>
					<NavigationMenuLink className={navigationMenuTriggerStyle()} href={discordUrl} target="_blank">
						<img src={discord.src} alt="Discord" />
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink
						className={navigationMenuTriggerStyle()}
						href="https://github.com/Kilcekru/dcc"
						target="_blank"
					>
						<img src={github.src} alt="Github" />
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink href={downloadUrl} target="_blank">
						<Button variant="outline">Download</Button>
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
