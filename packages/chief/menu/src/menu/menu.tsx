import {
	cn,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarPortal,
	MenubarSeparator,
	MenubarTrigger,
} from "@kilcekru/dcc-lib-components";
import { Menubar } from "@kilcekru/dcc-lib-components";
import { useSelector } from "@xstate/store/react";
import * as React from "react";

import * as IPC from "../ipc";
import { menuStore, setExpanded } from "../store";
import logo from "./logo.png";

export const Menu = () => {
	const menus = useSelector(menuStore, (state) => state.context.config?.menu);

	return (
		<div className="flex gap-2">
			<div className="flex h-full items-center justify-center ml-2">
				<img src={logo} className="h-5 w-5" />
			</div>
			<Menubar
				className="gap-2"
				onValueChange={(value) => {
					const show = value !== "";
					setExpanded(show);
				}}
			>
				{menus?.map((menu) => {
					if (menu.hidden) return null;
					return (
						<MenubarMenu key={menu.label}>
							<MenubarTrigger disabled={menu.disabled} className="no-drag">
								{menu.label}
							</MenubarTrigger>
							<MenubarPortal>
								<MenubarContent className="bg-slate-800">
									{menu.submenu?.map((item, index) => {
										if (item.type === "separator") return <MenubarSeparator key={index} />;
										if (item.hidden) return null;
										return (
											<MenubarItem
												key={item.label}
												className={cn("text-white p-2", {
													"opacity-50": item.disabled,
												})}
												disabled={item.disabled}
												onSelect={() => {
													IPC.handleAction(item.action);
												}}
											>
												{item.label}
											</MenubarItem>
										);
									})}
								</MenubarContent>
							</MenubarPortal>
						</MenubarMenu>
					);
				})}
			</Menubar>
		</div>
	);
};
