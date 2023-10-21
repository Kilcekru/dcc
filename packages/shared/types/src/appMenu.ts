export interface IPC {
	getConfig: () => Promise<Config>;
	handleAction: (action: Action) => void;
	expand: () => void;
	collapse: () => void;
	onConfigChanged: (listener: (config: Config) => void) => () => void;
}

export type Config = {
	menu: Menu[];
	isMaximized: boolean;
};

export interface Menu {
	label: string;
	hidden?: boolean;
	disabled?: boolean;
	submenu: MenuEntry[];
	highlight?: boolean;
}

export type MenuEntry =
	| {
			type?: undefined;
			label: string;
			action: Action;
			hotkeys?: string[];
			hidden?: boolean;
			disabled?: boolean;
			highlight?: boolean;
	  }
	| { type: "separator" };

export type Action =
	| "quit"
	| "minimize"
	| "maximize"
	| "unmaximize"
	| "resetZoom"
	| "zoomIn"
	| "zoomOut"
	| "toggleFullscreen"
	| "dev_reload"
	| "dev_forceReload"
	| "dev_openDevTools"
	| "dev_resetUserSettings"
	| "dev_logCampaignState"
	| "dev_captureDebugWindow"
	| "dev_captureTest"
	| "loadLauncher"
	| "loadSettings"
	| "loadAbout"
	| "loadCampaign"
	| "updateDcc"
	| "campaign_new"
	| "campaign_open"
	| "campaign_persistance";
