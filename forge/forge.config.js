module.exports = {
	packagerConfig: {
		name: "DCC",
		ignore: (path) => {
			return path != "" && path !== "/package.json" && !path.startsWith("/dist");
		},
	},
	rebuildConfig: {},
	makers: [
		{
			name: "@electron-forge/maker-squirrel",
			config: {
				name: "DCC",
				title: "Digital Crew Chief",
				exe: "DCC.exe",
			},
		},
	],
};
