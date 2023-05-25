const Path = require("path");

const iconPath = Path.join(__dirname, "icons/dcc.ico");

module.exports = {
	packagerConfig: {
		name: "DCC",
		ignore: (path) => {
			return path != "" && path !== "/package.json" && !path.startsWith("/dist");
		},
		icon: iconPath,
		asar: true,
		extraResource: ["vbs"],
	},
	rebuildConfig: {},
	makers: [
		{
			name: "@electron-forge/maker-squirrel",
			config: {
				name: "DCC",
				title: "Digital Crew Chief",
				exe: "DCC.exe",
				setupIcon: iconPath,
				iconUrl: "https://www.unkreativ.at/dcc/dcc.ico",
			},
		},
	],
};
