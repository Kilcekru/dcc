module.exports = {
	packagerConfig: {
		name: "dcc",
		ignore: (path) => {
			return path != "" && path !== "/package.json" && !path.startsWith("/dist");
		},
	},
	rebuildConfig: {},
	makers: [
		{
			name: "@electron-forge/maker-squirrel",
			config: {
				name: "dcc",
				title: "DCS Crew Chief",
				exe: "dcc.exe",
			},
		},
	],
};
