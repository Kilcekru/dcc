import { AircraftType } from "./enums";
import { AircraftDefinition } from "./types";

export const aircraftDefinitions: Record<AircraftType, AircraftDefinition> = {
	"A-4E-C": {
		chaff: 30,
		display_name: "A-4E-C",
		flare: 30,
		max_fuel: 2221,
		max_height: 13380.72,
		max_speed: 1082.88,
		name: "A-4E-C",
		availableTasks: ["CAS", "Ground Attack", "Pinpoint Strike", "CAP", "DEAD", "Intercept"],
		carrierCapable: true,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 174.72222222222,
		era: "Early CW",
		isHelicopter: false,
		isMod: true,
		loadouts: [
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "<CLEAN>",
						num: 1,
					},
					{
						CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}",
						num: 2,
					},
					{
						CLSID: "{Mk-82_MER_4_C}",
						num: 3,
					},
					{
						CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}",
						num: 4,
					},
					{
						CLSID: "<CLEAN>",
						num: 5,
					},
				],
			},
			{
				task: "DEAD",
				name: "DEAD",
				displayName: "DEAD",
				pylons: [
					{
						CLSID: "{F3EFE0AB-E91A-42D8-9CA2-B63C91ED570A}",
						num: 1,
					},
					{
						CLSID: "{AGM_45A}",
						num: 2,
					},
					{
						CLSID: "{DFT-300gal}",
						num: 3,
					},
					{
						CLSID: "{AGM_45A}",
						num: 4,
					},
					{
						CLSID: "{F3EFE0AB-E91A-42D8-9CA2-B63C91ED570A}",
						num: 5,
					},
				],
			},
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "{LAU3_FFAR_MK1HE}",
						num: 1,
					},
					{
						CLSID: "{LAU-3 FFAR Mk5 HEAT_TER_2_L}",
						num: 2,
					},
					{
						CLSID: "{DFT-300gal}",
						num: 3,
					},
					{
						CLSID: "{LAU-3 FFAR Mk5 HEAT_TER_2_R}",
						num: 4,
					},
					{
						CLSID: "{LAU3_FFAR_MK1HE}",
						num: 5,
					},
				],
			},
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{
						CLSID: "{AIM-9P5-ON-ADAPTER}",
						num: 1,
					},
					{
						CLSID: "{AIM-9P5-ON-ADAPTER}",
						num: 2,
					},
					{
						CLSID: "{DFT-150gal}",
						num: 3,
					},
					{
						CLSID: "{AIM-9P5-ON-ADAPTER}",
						num: 4,
					},
					{
						CLSID: "{AIM-9P5-ON-ADAPTER}",
						num: 5,
					},
				],
			},
		],
	},
	"A-10A": {
		chaff: 240,
		display_name: "A-10A",
		flare: 120,
		max_fuel: 5029,
		max_height: 10000,
		max_speed: 720,
		name: "A-10A",
		availableTasks: ["CAS", "Ground Attack", "Pinpoint Strike"],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 133.61111111111,
		era: "Early CW",
		isHelicopter: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{6D21ECEA-F85B-4E8D-9D51-31DC9B8AA4EF}", num: 1 },
					{ CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}", num: 2 },
					{ CLSID: "{E6A6262A-CA08-4B3D-B030-E1A993B98452}", num: 3 },
					{ CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}", num: 4 },
					{ CLSID: "{5335D97A-35A5-4643-9D9B-026C75961E52}", num: 5 },
					{
						CLSID: "<CLEAN>",
						num: 6,
					},
					{ CLSID: "{5335D97A-35A5-4643-9D9B-026C75961E52}", num: 7 },
					{ CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}", num: 8 },
					{ CLSID: "{E6A6262A-CA08-4B3D-B030-E1A993B98453}", num: 9 },
					{ CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}", num: 10 },
					{ CLSID: "{DB434044-F5D0-4F1F-9BA9-B73027E18DD3}", num: 11 },
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "ALQ_184",
						num: 1,
					},
					{
						CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}",
						num: 2,
					},
					{
						CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}",
						num: 3,
					},
					{
						CLSID: "{AB8B8299-F1CC-4359-89B5-2172E0CF4A5A}",
						num: 4,
					},
					{
						CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}",
						num: 5,
					},
					{
						CLSID: "<CLEAN>",
						num: 6,
					},
					{
						CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}",
						num: 7,
					},
					{
						CLSID: "{AB8B8299-F1CC-4359-89B5-2172E0CF4A5A}",
						num: 8,
					},
					{
						CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}",
						num: 9,
					},
					{
						CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}",
						num: 10,
					},
					{
						CLSID: "{DB434044-F5D0-4F1F-9BA9-B73027E18DD3}",
						num: 11,
					},
				],
			},
		],
	},
	"A-10C": {
		chaff: 240,
		display_name: "A-10C",
		flare: 120,
		max_fuel: 5029,
		max_height: 10000,
		max_speed: 720,
		name: "A-10C",
		availableTasks: ["CAS", "Ground Attack", "Pinpoint Strike"],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 133.61111111111,
		era: "Late CW",
		isHelicopter: false,
		loadouts: [
			{
				task: "default",
				displayName: "default",
				name: "default",
				pylons: [
					{ CLSID: "ALQ_184", num: 1 },
					{
						CLSID: "<CLEAN>",
						num: 2,
					},
					{ CLSID: "LAU_88_AGM_65H_2_L", num: 3 },
					{ CLSID: "{5335D97A-35A5-4643-9D9B-026C75961E52}", num: 4 },
					{ CLSID: "{CBU-87}", num: 5 },
					{
						CLSID: "<CLEAN>",
						num: 6,
					},
					{ CLSID: "{CBU-87}", num: 7 },
					{ CLSID: "{5335D97A-35A5-4643-9D9B-026C75961E52}", num: 8 },
					{ CLSID: "{E6A6262A-CA08-4B3D-B030-E1A993B98453}", num: 9 },
					{ CLSID: "{A111396E-D3E8-4b9c-8AC9-2432489304D5}", num: 10 },
					{ CLSID: "{DB434044-F5D0-4F1F-9BA9-B73027E18DD3}", num: 11 },
				],
			},
			{
				task: "Pinpoint Strike",
				displayName: "Strike",
				name: "Strike",
				pylons: [
					{
						CLSID: "ALQ_184",
						num: 1,
					},
					{
						CLSID: "<CLEAN>",
						num: 2,
					},
					{
						CLSID: "{69DC8AE7-8F77-427B-B8AA-B19D3F478B66}",
						num: 3,
					},
					{
						CLSID: "{GBU-38}",
						num: 4,
					},
					{
						CLSID: "{GBU-38}",
						num: 5,
					},
					{
						CLSID: "<CLEAN>",
						num: 6,
					},
					{
						CLSID: "{GBU-38}",
						num: 7,
					},
					{
						CLSID: "{GBU-38}",
						num: 8,
					},
					{
						CLSID: "{69DC8AE7-8F77-427B-B8AA-B19D3F478B66}",
						num: 9,
					},
					{
						CLSID: "{A111396E-D3E8-4b9c-8AC9-2432489304D5}",
						num: 10,
					},
					{
						CLSID: "{DB434044-F5D0-4F1F-9BA9-B73027E18DD3}",
						num: 11,
					},
				],
			},
		],
	},
	"A-10C_2": {
		chaff: 240,
		display_name: "A-10C II",
		flare: 240,
		max_fuel: 5029,
		max_height: 10000,
		max_speed: 720,
		name: "A-10C_2",
		availableTasks: ["CAS", "Ground Attack", "Pinpoint Strike"],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 133.61111111111,
		era: "Modern",
		isHelicopter: false,
		customCallsigns: ["Hawg", "Boar", "Pig", "Tusk"],
		loadouts: [
			{
				task: "default",
				displayName: "default",
				name: "default",
				pylons: [
					{ CLSID: "ALQ_184", num: 1 },
					{ CLSID: "{69926055-0DA8-4530-9F2F-C86B157EA9F6}", num: 2 },
					{ CLSID: "LAU_88_AGM_65H_2_L", num: 3 },
					{ CLSID: "{DB769D48-67D7-42ED-A2BE-108D566C8B1E}", num: 4 },
					{ CLSID: "{GBU-38}", num: 5 },
					{
						CLSID: "<CLEAN>",
						num: 6,
					},
					{ CLSID: "{GBU-38}", num: 7 },
					{ CLSID: "{DB769D48-67D7-42ED-A2BE-108D566C8B1E}", num: 8 },
					{ CLSID: "{E6A6262A-CA08-4B3D-B030-E1A993B98453}", num: 9 },
					{ CLSID: "{A111396E-D3E8-4b9c-8AC9-2432489304D5}", num: 10 },
					{ CLSID: "{DB434044-F5D0-4F1F-9BA9-B73027E18DD3}", num: 11 },
				],
			},
			{
				task: "Pinpoint Strike",
				displayName: "Strike",
				name: "Strike",
				pylons: [
					{
						CLSID: "ALQ_184",
						num: 1,
					},
					{
						CLSID: "<CLEAN>",
						num: 2,
					},
					{
						CLSID: "{69DC8AE7-8F77-427B-B8AA-B19D3F478B66}",
						num: 3,
					},
					{
						CLSID: "{GBU-38}",
						num: 4,
					},
					{
						CLSID: "{GBU-38}",
						num: 5,
					},
					{
						CLSID: "<CLEAN>",
						num: 6,
					},
					{
						CLSID: "{GBU-38}",
						num: 7,
					},
					{
						CLSID: "{GBU-38}",
						num: 8,
					},
					{
						CLSID: "{69DC8AE7-8F77-427B-B8AA-B19D3F478B66}",
						num: 9,
					},
					{
						CLSID: "{A111396E-D3E8-4b9c-8AC9-2432489304D5}",
						num: 10,
					},
					{
						CLSID: "{DB434044-F5D0-4F1F-9BA9-B73027E18DD3}",
						num: 11,
					},
				],
			},
		],
	},
	AV8BNA: {
		chaff: 60,
		display_name: "AV-8B Harrier",
		flare: 120,
		max_fuel: 3519.423,
		max_height: 13716,
		max_speed: 990,
		name: "AV8BNA",
		availableTasks: ["CAS", "Ground Attack", "Pinpoint Strike", "SEAD", "DEAD"],
		carrierCapable: true,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Late CW",
		isHelicopter: false,
		loadouts: [
			{
				task: "CAS",
				displayName: "CAS",
				name: "CAS",
				pylons: [
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 1,
					},
					{
						CLSID: "LAU_117_AGM_65F",
						num: 2,
					},
					{
						CLSID: "{BRU-70A_2*GBU-54_LEFT}",
						num: 3,
					},
					{
						CLSID: "{GAU_12_Equalizer_AP}",
						num: 4,
					},
					{
						CLSID: "{A111396E-D3E8-4b9c-8AC9-2432489304D5}",
						num: 5,
					},
					{
						CLSID: "{BRU-70A_2*GBU-54_RIGHT}",
						num: 6,
					},
					{
						CLSID: "LAU_117_AGM_65F",
						num: 7,
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 8,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				displayName: "Strike",
				name: "Strike",
				pylons: [
					{
						CLSID: "<CLEAN>",
						num: 1,
					},
					{
						CLSID: "{BRU-70A_3*GBU-54}",
						num: 2,
					},
					{
						CLSID: "{GBU_32_V_2B}",
						num: 3,
					},
					{
						CLSID: "{GAU_12_Equalizer}",
						num: 4,
					},
					{
						CLSID: "{A111396E-D3E8-4b9c-8AC9-2432489304D5}",
						num: 5,
					},
					{
						CLSID: "{GBU_32_V_2B}",
						num: 6,
					},
					{
						CLSID: "{BRU-70A_3*GBU-54}",
						num: 7,
					},
					{
						CLSID: "<CLEAN>",
						num: 8,
					},
				],
			},
			{
				task: "DEAD",
				displayName: "DEAD",
				name: "DEAD",
				pylons: [
					{
						CLSID: "{AGM_122_SIDEARM}",
						num: 1,
					},
					{
						CLSID: "{LAU_7_AGM_122_SIDEARM}",
						num: 2,
					},
					{
						CLSID: "LAU_117_AGM_65F",
						num: 3,
					},
					{
						CLSID: "{GAU_12_Equalizer}",
						num: 4,
					},
					{
						CLSID: "{ALQ_164_RF_Jammer}",
						num: 5,
					},
					{
						CLSID: "LAU_117_AGM_65F",
						num: 6,
					},
					{
						CLSID: "{LAU_7_AGM_122_SIDEARM}",
						num: 7,
					},
					{
						CLSID: "{AGM_122_SIDEARM}",
						num: 8,
					},
				],
			},
			{
				task: "SEAD",
				displayName: "SEAD",
				name: "SEAD",
				pylons: [
					{
						CLSID: "{AGM_122_SIDEARM}",
						num: 1,
					},
					{
						CLSID: "{LAU_7_AGM_122_SIDEARM}",
						num: 2,
					},
					{
						CLSID: "LAU_117_AGM_65F",
						num: 3,
					},
					{
						CLSID: "{GAU_12_Equalizer}",
						num: 4,
					},
					{
						CLSID: "{ALQ_164_RF_Jammer}",
						num: 5,
					},
					{
						CLSID: "LAU_117_AGM_65F",
						num: 6,
					},
					{
						CLSID: "{LAU_7_AGM_122_SIDEARM}",
						num: 7,
					},
					{
						CLSID: "{AGM_122_SIDEARM}",
						num: 8,
					},
				],
			},
			{
				task: "default",
				displayName: "default",
				name: "default",
				pylons: [
					{ CLSID: "{DB769D48-67D7-42ED-A2BE-108D566C8B1E}", num: 1 },
					{ CLSID: "LAU_117_AGM_65F", num: 2 },
					{ CLSID: "{BRU-70_2*CBU-99_LEFT}", num: 3 },
					{ CLSID: "{GAU_12_Equalizer}", num: 4 },
					{ CLSID: "{A111396E-D3E8-4b9c-8AC9-2432489304D5}", num: 5 },
					{ CLSID: "{BRU-70_2*CBU-99_RIGHT}", num: 6 },
					{ CLSID: "LAU_117_AGM_65F", num: 7 },
					{ CLSID: "{DB769D48-67D7-42ED-A2BE-108D566C8B1E}", num: 8 },
				],
			},
		],
	},
	"B-1B": {
		chaff: 60,
		display_name: "B-1B",
		flare: 30,
		max_fuel: 88450,
		max_height: 18000,
		max_speed: 1530,
		name: "B-1B",
		availableTasks: [],
		carrierCapable: false,
		controllable: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Late CW",
		isHelicopter: false,
		isLarge: true,
		loadouts: [
			{
				task: "default",
				displayName: "default",
				name: "default",
				pylons: [
					{ CLSID: "GBU-38*16", num: 1 },
					{ CLSID: "GBU-31*8", num: 2 },
					{ CLSID: "GBU-38*16", num: 3 },
				],
			},
		],
	},
	"C-101CC": {
		chaff: 0,
		display_name: "C-101CC",
		flare: 0,
		max_fuel: 1796,
		max_height: 11000,
		max_speed: 925.2,
		name: "C-101CC",
		availableTasks: ["CAS", "Pinpoint Strike"],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 133.61111111111,
		era: "Late CW",
		isHelicopter: false,
		loadouts: [
			{
				task: "CAS",
				displayName: "CAS",
				name: "CAS",
				pylons: [
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 1,
					},
					{
						CLSID: "{08164777-5E9C-4B08-B48E-5AA7AFB246E2}",
						num: 2,
					},
					{
						CLSID: "{A021F29D-18AB-4d3e-985C-FC9C60E35E9E}",
						num: 3,
					},
					{
						CLSID: "{AN-M3}",
						num: 4,
					},
					{
						CLSID: "{A021F29D-18AB-4d3e-985C-FC9C60E35E9E}",
						num: 5,
					},
					{
						CLSID: "{08164777-5E9C-4B08-B48E-5AA7AFB246E2}",
						num: 6,
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 7,
					},
				],
			},
			{
				task: "default",
				displayName: "Default",
				name: "Default",
				pylons: [
					{
						CLSID: "{9BFD8C90-F7AE-4e90-833B-BFD0CED0E536}",
						num: 1,
					},
					{
						CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}",
						num: 2,
					},
					{
						CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}",
						num: 3,
					},
					{
						CLSID: "<CLEAN>",
						num: 4,
					},
					{
						CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}",
						num: 5,
					},
					{
						CLSID: "{BCE4E030-38E9-423E-98ED-24BE3DA87C32}",
						num: 6,
					},
					{
						CLSID: "{9BFD8C90-F7AE-4e90-833B-BFD0CED0E536}",
						num: 7,
					},
				],
			},
		],
	},
	"C-130": {
		chaff: 120,
		display_name: "C-130",
		flare: 60,
		max_fuel: 20830,
		max_height: 10000,
		max_speed: 610,
		name: "C-130",
		availableTasks: ["Transport"],
		carrierCapable: false,
		controllable: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 174.72222222222,
		era: "Korea",
		isHelicopter: false,
		loadouts: [
			{
				task: "default",
				displayName: "default",
				name: "default",
				pylons: [],
			},
		],
	},
	"C-17A": {
		chaff: 120,
		display_name: "C-17A",
		flare: 60,
		max_fuel: 132405,
		max_height: 13700,
		max_speed: 850,
		name: "C-17A",
		availableTasks: ["Transport"],
		carrierCapable: false,
		controllable: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 133.61111111111,
		era: "Modern",
		isHelicopter: false,
		loadouts: [
			{
				task: "default",
				displayName: "default",
				name: "default",
				pylons: [],
			},
		],
	},
	"F-117A": {
		chaff: 0,
		display_name: "F-117A",
		flare: 0,
		max_fuel: 8255,
		max_height: 13700,
		max_speed: 1000,
		name: "F-117A",
		availableTasks: ["Pinpoint Strike"],
		carrierCapable: false,
		controllable: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		era: "Modern",
		isHelicopter: false,
		loadouts: [
			{
				task: "default",
				displayName: "default",
				name: "default",
				pylons: [
					{ CLSID: "{51F9AAE5-964F-4D21-83FB-502E3BFE5F8A}", num: 1 },
					{ CLSID: "{51F9AAE5-964F-4D21-83FB-502E3BFE5F8A}", num: 2 },
				],
			},
		],
	},
	"F-16A": {
		chaff: 60,
		display_name: "F-16A",
		flare: 30,
		max_fuel: 3104,
		max_height: 19000,
		max_speed: 2150,
		name: "F-16A",
		availableTasks: [
			"SEAD",
			"DEAD",
			"CAP",
			"CAS",
			"Escort",
			"Fighter Sweep",
			"Ground Attack",
			"Intercept",
			"Pinpoint Strike",
		],
		carrierCapable: false,
		controllable: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Late CW",
		isHelicopter: false,
		loadouts: [
			{
				task: "default",
				name: "Default",
				displayName: "Default",
				pylons: [
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 1,
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 2,
					},
					{
						CLSID: "{8D399DDA-FF81-4F14-904D-099B34FE7918}",
						num: 3,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 4,
					},
					{
						CLSID: "<CLEAN>",
						num: 5,
					},
					{
						CLSID: "{6D21ECEA-F85B-4E8D-9D51-31DC9B8AA4EF}",
						num: 6,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 7,
					},
					{
						CLSID: "{8D399DDA-FF81-4F14-904D-099B34FE7918}",
						num: 8,
					},
					{
						CLSID: "{AIM-9L}",
						num: 9,
					},
					{
						CLSID: "{AIM-9L}",
						num: 10,
					},
				],
			},
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "{C8E06185-7CD6-4C90-959F-044679E90751}",
						num: 1,
					},
					{
						CLSID: "<CLEAN>",
						num: 2,
					},
					{
						CLSID: "{E6A6262A-CA08-4B3D-B030-E1A993B98452}",
						num: 3,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 4,
					},
					{
						CLSID: "{CAAC1CFD-6745-416B-AFA4-CB57414856D0}",
						num: 5,
					},
					{
						CLSID: "{6D21ECEA-F85B-4E8D-9D51-31DC9B8AA4EF}",
						num: 6,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 7,
					},
					{
						CLSID: "{E6A6262A-CA08-4B3D-B030-E1A993B98453}",
						num: 8,
					},
					{
						CLSID: "<CLEAN>",
						num: 10,
					},
					{
						CLSID: "{C8E06185-7CD6-4C90-959F-044679E90751}",
						num: 10,
					},
				],
			},
			{
				task: "DEAD",
				name: "DEAD",
				displayName: "DEAD",
				pylons: [
					{
						CLSID: "{C8E06185-7CD6-4C90-959F-044679E90751}",
						num: 1,
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 2,
					},
					{
						CLSID: "{B06DD79A-F21E-4EB9-BD9D-AB3844618C93}",
						num: 3,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 4,
					},
					{
						CLSID: "<CLEAN>",
						num: 10,
					},
					{
						CLSID: "{6D21ECEA-F85B-4E8D-9D51-31DC9B8AA4EF}",
						num: 6,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 7,
					},
					{
						CLSID: "{B06DD79A-F21E-4EB9-BD9D-AB3844618C93}",
						num: 8,
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 9,
					},
					{
						CLSID: "{C8E06185-7CD6-4C90-959F-044679E90751}",
						num: 10,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{C8E06185-7CD6-4C90-959F-044679E90751}",
						num: 1,
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 2,
					},
					{
						CLSID: "{DB769D48-67D7-42ED-A2BE-108D566C8B1E}",
						num: 3,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 4,
					},
					{
						CLSID: "{CAAC1CFD-6745-416B-AFA4-CB57414856D0}",
						num: 5,
					},
					{
						CLSID: "{6D21ECEA-F85B-4E8D-9D51-31DC9B8AA4EF}",
						num: 6,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 7,
					},
					{
						CLSID: "{DB769D48-67D7-42ED-A2BE-108D566C8B1E}",
						num: 8,
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 9,
					},
					{
						CLSID: "{C8E06185-7CD6-4C90-959F-044679E90751}",
						num: 10,
					},
				],
			},
		],
	},
	"F-16C_50": {
		chaff: 60,
		display_name: "F-16C",
		flare: 60,
		gun: 100,
		ammo_type: 5,
		max_fuel: 3249,
		max_height: 15240,
		max_speed: 2120.04,
		name: "F-16C_50",
		availableTasks: [
			"SEAD",
			"DEAD",
			"CAP",
			"CAS",
			"Escort",
			"Fighter Sweep",
			"Ground Attack",
			"Intercept",
			"Pinpoint Strike",
			"Runway Attack",
		],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Modern",
		carrierCapable: false,
		AddPropAircraft: {
			STN_L16: "{STN_L16}",
			VoiceCallsignNumber: "{VoiceCallsignNumber}",
			VoiceCallsignLabel: "ED",
			HelmetMountedDevice: 1,
			LAU3ROF: 0,
			LaserCode100: 6,
			LaserCode1: 8,
			LaserCode10: 8,
		},
		datalinks: {
			Link16: {
				settings: {
					flightLead: true,
					transmitPower: 3,
					specialChannel: 1,
					fighterChannel: 1,
					missionChannel: 1,
				},
			},
		},
		customCallsigns: ["Viper", "Venom", "Lobo", "Cowboy", "Python", "Wolf", "Weasel", "Wild", "Ninja", "Jedi"],
		loadouts: [
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 1,
					},
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 2,
					},
					{
						CLSID: "{BRU57_2*CBU-103}",
						num: 3,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 4,
					},
					{
						CLSID: "ALQ_184_Long",
						num: 5,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 6,
					},
					{
						CLSID: "{BRU57_2*CBU-105}",
						num: 7,
					},
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 8,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 9,
					},
					{
						CLSID: "<CLEAN>",
						num: 10,
					},
					{
						CLSID: "{A111396E-D3E8-4b9c-8AC9-2432489304D5}",
						num: 11,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 1,
					},
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 2,
					},
					{
						CLSID: "{BRU57_2*GBU-38}",
						num: 3,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 4,
					},
					{
						CLSID: "ALQ_184_Long",
						num: 5,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 6,
					},
					{
						CLSID: "{BRU57_2*GBU-38}",
						num: 7,
					},
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 8,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 9,
					},
					{
						CLSID: "<CLEAN>",
						num: 10,
					},
					{
						CLSID: "{A111396E-D3E8-4b9c-8AC9-2432489304D5}",
						num: 11,
					},
				],
			},
			{
				task: "DEAD",
				name: "DEAD",
				displayName: "DEAD",
				pylons: [
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 1,
					},
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 2,
					},
					{
						CLSID: "{B06DD79A-F21E-4EB9-BD9D-AB3844618C93}",
						num: 3,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 4,
					},
					{
						CLSID: "ALQ_184_Long",
						num: 5,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 6,
					},
					{
						CLSID: "{B06DD79A-F21E-4EB9-BD9D-AB3844618C93}",
						num: 7,
					},
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 8,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 9,
					},
					{
						CLSID: "{AN_ASQ_213}",
						num: 10,
					},
					{
						CLSID: "{A111396E-D3E8-4b9c-8AC9-2432489304D5}",
						num: 11,
					},
				],
			},
			{
				task: "SEAD",
				name: "SEAD",
				displayName: "SEAD",
				pylons: [
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 1,
					},
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 2,
					},
					{
						CLSID: "{B06DD79A-F21E-4EB9-BD9D-AB3844618C93}",
						num: 3,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 4,
					},
					{
						CLSID: "ALQ_184_Long",
						num: 5,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 6,
					},
					{
						CLSID: "{B06DD79A-F21E-4EB9-BD9D-AB3844618C93}",
						num: 7,
					},
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 8,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 9,
					},
					{
						CLSID: "{AN_ASQ_213}",
						num: 10,
					},
					{
						CLSID: "{A111396E-D3E8-4b9c-8AC9-2432489304D5}",
						num: 11,
					},
				],
			},
			{
				task: "default",
				name: "AIM-120C*4, AIM-9X*2, FUEL*2",
				displayName: "AIM-120C*4, AIM-9X*2, FUEL*2",
				pylons: [
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 1,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 2,
					},
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 3,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 4,
					},
					{
						CLSID: "<CLEAN>",
						num: 5,
					},
					{
						CLSID: "{F376DBEE-4CAE-41BA-ADD9-B2910AC95DEC}",
						num: 6,
					},
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 7,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 8,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 9,
					},
				],
			},
		],
	},
	"FA-18C_hornet": {
		chaff: 60,
		display_name: "F/A-18C",
		flare: 60,
		max_fuel: 4900,
		max_height: 18200,
		max_speed: 1950.12,
		name: "FA-18C_hornet",
		availableTasks: [
			"SEAD",
			"DEAD",
			"CAP",
			"CAS",
			"Escort",
			"Fighter Sweep",
			"Ground Attack",
			"Intercept",
			"Pinpoint Strike",
			"Runway Attack",
		],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Modern",
		carrierCapable: true,
		loadouts: [
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 1,
					},
					{
						CLSID: "LAU_117_AGM_65F",
						num: 2,
					},
					{
						CLSID: "{BRU33_2X_GBU-12}",
						num: 3,
					},
					{
						CLSID: "{AN_ASQ_228}",
						num: 4,
					},
					{
						CLSID: "{EFEC8201-B922-11d7-9897-000476191836}",
						num: 5,
					},
					{
						CLSID: "{8D399DDA-FF81-4F14-904D-099B34FE7918}",
						num: 6,
					},
					{
						CLSID: "{BRU33_2X_GBU-12}",
						num: 7,
					},
					{
						CLSID: "LAU_117_AGM_65F",
						num: 8,
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 9,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Pinpoint Strike",
				displayName: "Pinpoint Strike",
				pylons: [
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 1,
					},
					{
						CLSID: "{BRU55_2*GBU-38}",
						num: 2,
					},
					{
						CLSID: "{GBU_32_V_2B}",
						num: 3,
					},
					{
						CLSID: "{AN_ASQ_228}",
						num: 4,
					},
					{
						CLSID: "{FPU_8A_FUEL_TANK}",
						num: 5,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 6,
					},
					{
						CLSID: "{GBU_32_V_2B}",
						num: 7,
					},
					{
						CLSID: "{BRU55_2*GBU-38}",
						num: 8,
					},
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 9,
					},
				],
			},
			{
				task: "DEAD",
				name: "DEAD",
				displayName: "DEAD",
				pylons: [
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 1,
					},
					{
						CLSID: "{9BCC2A2B-5708-4860-B1F1-053A18442067}",
						num: 2,
					},
					{
						CLSID: "{B06DD79A-F21E-4EB9-BD9D-AB3844618C93}",
						num: 3,
					},
					{
						CLSID: "{AN_ASQ_228}",
						num: 4,
					},
					{
						CLSID: "{FPU_8A_FUEL_TANK}",
						num: 5,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 6,
					},
					{
						CLSID: "{B06DD79A-F21E-4EB9-BD9D-AB3844618C93}",
						num: 7,
					},
					{
						CLSID: "{9BCC2A2B-5708-4860-B1F1-053A18442067}",
						num: 8,
					},
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 9,
					},
				],
			},
			{
				task: "default",
				name: "AIM-120C*4, AIM-9X*2, FUEL*2",
				displayName: "AIM-120C*4, AIM-9X*2, FUEL*2",
				pylons: [
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 1,
					},
					{
						CLSID: "LAU-115_2*LAU-127_AIM-120C",
						num: 2,
					},
					{
						CLSID: "{FPU_8A_FUEL_TANK}",
						num: 3,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 4,
					},
					{
						CLSID: "<CLEAN>",
						num: 5,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 6,
					},
					{
						CLSID: "{FPU_8A_FUEL_TANK}",
						num: 7,
					},
					{
						CLSID: "LAU-115_2*LAU-127_AIM-120C",
						num: 8,
					},
					{
						CLSID: "{5CE2FF2A-645A-4197-B48D-8720AC69394F}",
						num: 9,
					},
				],
			},
		],
	},
	"B-52H": {
		chaff: 1125,
		display_name: "B-52H",
		flare: 192,
		max_fuel: 141135,
		max_height: 17000,
		max_speed: 1000,
		name: "B-52H",
		availableTasks: [],
		controllable: false,
		cruiseAltitude: 9144,
		cruiseSpeed: 220.97222222222,
		isHelicopter: false,
		isLarge: true,
		era: "Early CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "Bombs",
				displayName: "Bombs",
				pylons: [
					{
						CLSID: "{585D626E-7F42-4073-AB70-41E728C333E2}",
						num: 1,
					},
					{
						CLSID: "{6C47D097-83FF-4FB2-9496-EAB36DDF0B05}",
						num: 2,
					},
					{
						CLSID: "{585D626E-7F42-4073-AB70-41E728C333E2}",
						num: 3,
					},
				],
			},
		],
	},
	"F-4E-45MC": {
		chaff: 120,
		display_name: "F-4E",
		flare: 30,
		max_fuel: 5510.5,
		max_height: 19000,
		max_speed: 2370,
		name: "F-4E-45MC",
		availableTasks: [
			"CAS",
			"CAP",
			"Escort",
			"Intercept",
			"Fighter Sweep",
			"Ground Attack",
			"Pinpoint Strike",
			"SEAD",
			"DEAD",
		],
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		isHelicopter: false,
		era: "Early CW",
		carrierCapable: false,
		isMod: false,
		AddPropAircraft: {
			LaserCodeDigit1: 1,
			TacanBand: 0,
			Quality: 100,
			ChaffDoubleDispense: false,
			LaserCodeDigit4: 8,
			IffMode2Digit4: 0,
			IffMode2Digit2: 0,
			IsNvgAllowed: true,
			LaserCodeDigit2: 6,
			KY28Key: 1,
			LaserCodeDigit3: 8,
			IffMode2Digit1: 0,
			VORILSFrequencyDecimalMHZ: 0,
			UseReferenceAircraft: false,
			IffMode2Digit3: 0,
			Wear: 0,
			VORILSFrequencyMHZ: 108,
			TacanChannel: 0,
			INSAlignmentStored: true,
		},
		loadouts: [
			{
				task: "default",
				name: "Default",
				displayName: "Default",
				pylons: [
					{
						CLSID: "{F4_SARGENT_TANK_370_GAL}",
					},
					{
						CLSID: "{AIM-9J}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{AIM-9J}",
					},
					{
						CLSID: "{HB_F4E_AIM-7E}",
					},
					{
						CLSID: "{HB_F4E_AIM-7E}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_AIM-7E}",
					},
					{
						CLSID: "{HB_F4E_AIM-7E}",
					},
					{
						CLSID: "{AIM-9J}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{AIM-9J}",
					},
					{
						CLSID: "{F4_SARGENT_TANK_370_GAL_R}",
					},
					{
						CLSID: "{HB_ALE_40_30_60}",
					},
				],
			},
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "{HB_F4E_CBU-52B_MER_3x_Left}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_CBU-52B_2x}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_AIM-7E-2}",
					},
					{
						CLSID: "{HB_F4E_AIM-7E-2}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_AIM-7E-2}",
					},
					{
						CLSID: "{HB_F4E_AIM-7E-2}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_CBU-52B_2x}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_CBU-52B_MER_3x_Right}",
					},
					{
						CLSID: "{HB_ALE_40_30_60}",
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{HB_F4E_MK-83_MER_2x}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_MK-83_3x}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_AIM-7E-2}",
					},
					{
						CLSID: "{HB_ALQ-131_ON_ADAPTER_IN_AERO7}",
					},
					{
						CLSID: "{HB_F4E_MK-83_MER_3x_Ripple}",
					},
					{
						CLSID: "{HB_F4E_AIM-7E-2}",
					},
					{
						CLSID: "{HB_F4E_AIM-7E-2}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_MK-83_3x}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_MK-83_MER_2x}",
					},
					{
						CLSID: "{HB_ALE_40_30_60}",
					},
				],
			},
			{
				task: "DEAD",
				name: "DEAD",
				displayName: "DEAD",
				pylons: [
					{
						CLSID: "{HB_F4E_CBU-52B_MER_3x_Left}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_CBU-52B_2x}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_AIM-7E-2}",
					},
					{
						CLSID: "{HB_F4E_AIM-7E-2}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_AIM-7E-2}",
					},
					{
						CLSID: "{HB_F4E_AIM-7E-2}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_CBU-52B_2x}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{HB_F4E_CBU-52B_MER_3x_Right}",
					},
					{
						CLSID: "{HB_ALE_40_30_60}",
					},
				],
			},
			{
				task: "SEAD",
				name: "SEAD",
				displayName: "SEAD",
				pylons: [
					{
						CLSID: "{LAU_34_AGM_45A}",
					},
					{
						CLSID: "{AIM-9L}",
					},
					{
						CLSID: "{HB_F4E_AGM-65A_LAU117_SWA}",
					},
					{
						CLSID: "{AIM-9L}",
					},
					{
						CLSID: "{HB_F4E_AIM-7F}",
					},
					{
						CLSID: "{HB_ALQ-131_ON_ADAPTER_IN_AERO7}",
					},
					{
						CLSID: "{F4_SARGENT_TANK_600_GAL}",
					},
					{
						CLSID: "{HB_F4E_AIM-7F}",
					},
					{
						CLSID: "{HB_F4E_AIM-7F}",
					},
					{
						CLSID: "{AIM-9L}",
					},
					{
						CLSID: "{HB_F4E_AGM-65A_LAU117_SWA}",
					},
					{
						CLSID: "{AIM-9L}",
					},
					{
						CLSID: "{LAU_34_AGM_45A}",
					},
					{
						CLSID: "{HB_ALE_40_30_60}",
					},
				],
			},
		],
	},
	VSN_F4B: {
		chaff: 48,
		display_name: "F-4B",
		flare: 48,
		max_fuel: 6416,
		max_height: 19000,
		max_speed: 2370,
		name: "VSN_F4B",
		availableTasks: ["CAP", "Escort", "Intercept", "Fighter Sweep", "Ground Attack", "Pinpoint Strike"],
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		isHelicopter: false,
		era: "Early CW",
		carrierCapable: true,
		isMod: true,
		allowedFrequency: [110, 150],
		loadouts: [
			{
				task: "default",
				name: "Default",
				displayName: "Default",
				pylons: [
					{
						CLSID: "<CLEAN>",
						num: 1,
					},
					{
						CLSID: "<CLEAN>",
						num: 2,
					},
					{
						CLSID: "{F4-2-AIM9B}",
						num: 3,
					},
					{
						CLSID: "{AIM-7E}",
						num: 4,
					},
					{
						CLSID: "{AIM-7E}",
						num: 5,
					},
					{
						CLSID: "VSN_F4EC_PTB",
						num: 6,
					},
					{
						CLSID: "{AIM-7E}",
						num: 7,
					},
					{
						CLSID: "{AIM-7E}",
						num: 8,
					},
					{
						CLSID: "{F4-2-AIM9B}",
						num: 9,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "<CLEAN>",
						num: 2,
					},
					{
						CLSID: "{BRU41_6X_MK-82}",
						num: 2,
					},
					{
						CLSID: "{60CC734F-0AFA-4E2E-82B8-93B941AB11CF}",
						num: 3,
					},
					{
						CLSID: "{AIM-7E}",
						num: 4,
					},
					{
						CLSID: "{AIM-7E}",
						num: 5,
					},
					{
						CLSID: "VSN_F4EC_PTB",
						num: 6,
					},
					{
						CLSID: "{AIM-7E}",
						num: 7,
					},
					{
						CLSID: "{AIM-7E}",
						num: 8,
					},
					{
						CLSID: "{60CC734F-0AFA-4E2E-82B8-93B941AB11CF}",
						num: 9,
					},
					{
						CLSID: "{BRU41_6X_MK-82}",
						num: 10,
					},
				],
			},
		],
	},
	VSN_F4C: {
		chaff: 48,
		display_name: "F-4C",
		flare: 48,
		max_fuel: 6416,
		max_height: 19000,
		max_speed: 2370,
		name: "VSN_F4C",
		availableTasks: ["CAP", "Escort", "Intercept", "Fighter Sweep", "Ground Attack", "Pinpoint Strike"],
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		isHelicopter: false,
		era: "Early CW",
		carrierCapable: false,
		isMod: true,
		allowedFrequency: [110, 150],
		loadouts: [
			{
				task: "default",
				name: "Default",
				displayName: "Default",
				pylons: [
					{
						CLSID: "<CLEAN>",
						num: 1,
					},
					{
						CLSID: "<CLEAN>",
						num: 2,
					},
					{
						CLSID: "{F4-2-AIM9B}",
						num: 3,
					},
					{
						CLSID: "{AIM-7E}",
						num: 4,
					},
					{
						CLSID: "{AIM-7E}",
						num: 5,
					},
					{
						CLSID: "VSN_F4EC_PTB",
						num: 6,
					},
					{
						CLSID: "{AIM-7E}",
						num: 7,
					},
					{
						CLSID: "{AIM-7E}",
						num: 8,
					},
					{
						CLSID: "{F4-2-AIM9B}",
						num: 9,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "<CLEAN>",
						num: 2,
					},
					{
						CLSID: "{BRU41_6X_MK-82}",
						num: 2,
					},
					{
						CLSID: "{60CC734F-0AFA-4E2E-82B8-93B941AB11CF}",
						num: 3,
					},
					{
						CLSID: "{AIM-7E}",
						num: 4,
					},
					{
						CLSID: "{AIM-7E}",
						num: 5,
					},
					{
						CLSID: "VSN_F4EC_PTB",
						num: 6,
					},
					{
						CLSID: "{AIM-7E}",
						num: 7,
					},
					{
						CLSID: "{AIM-7E}",
						num: 8,
					},
					{
						CLSID: "{60CC734F-0AFA-4E2E-82B8-93B941AB11CF}",
						num: 9,
					},
					{
						CLSID: "{BRU41_6X_MK-82}",
						num: 10,
					},
				],
			},
		],
	},
	"F-4E": {
		chaff: 60,
		display_name: "F-4E",
		flare: 30,
		max_fuel: 4864,
		max_height: 19000,
		max_speed: 2370,
		name: "F-4E",
		availableTasks: ["CAP", "Fighter Sweep", "Ground Attack", "Pinpoint Strike", "DEAD"],
		controllable: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		isHelicopter: false,
		era: "Early CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "AIM-9*4, AIM-7*4, Fuel*2",
				displayName: "AIM-9*4, AIM-7*4, Fuel*2",
				pylons: [
					{ CLSID: "{7B4B122D-C12C-4DB4-834E-4D8BB4D863A8}", num: 1 },
					{ CLSID: "{9DDF5297-94B9-42FC-A45E-6E316121CD85}", num: 2 },
					{ CLSID: "{8D399DDA-FF81-4F14-904D-099B34FE7918}", num: 3 },
					{ CLSID: "{8D399DDA-FF81-4F14-904D-099B34FE7918}", num: 4 },
					{
						CLSID: "<CLEAN>",
						num: 5,
					},
					{ CLSID: "{8D399DDA-FF81-4F14-904D-099B34FE7918}", num: 6 },
					{ CLSID: "{8D399DDA-FF81-4F14-904D-099B34FE7918}", num: 7 },
					{ CLSID: "{9DDF5297-94B9-42FC-A45E-6E316121CD85}", num: 8 },
					{ CLSID: "{7B4B122D-C12C-4DB4-834E-4D8BB4D863A8}", num: 9 },
				],
			},
			{
				task: "DEAD",
				name: "DEAD",
				displayName: "DEAD",
				pylons: [
					{
						CLSID: "{7B4B122D-C12C-4DB4-834E-4D8BB4D863A8}",
						num: 1,
					},
					{
						CLSID: "{3E6B632D-65EB-44D2-9501-1C2D04515405}",
						num: 2,
					},
					{
						CLSID: "{6D21ECEA-F85B-4E8D-9D51-31DC9B8AA4EF}",
						num: 3,
					},
					{
						CLSID: "{8D399DDA-FF81-4F14-904D-099B34FE7918}",
						num: 4,
					},
					{
						CLSID: "<CLEAN>",
						num: 5,
					},
					{
						CLSID: "{8D399DDA-FF81-4F14-904D-099B34FE7918}",
						num: 6,
					},
					{
						CLSID: "<CLEAN>",
						num: 7,
					},
					{
						CLSID: "{3E6B632D-65EB-44D2-9501-1C2D04515405}",
						num: 8,
					},
					{
						CLSID: "{7B4B122D-C12C-4DB4-834E-4D8BB4D863A8}",
						num: 9,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{1C97B4A0-AA3B-43A8-8EE7-D11071457185}",
						num: 1,
					},
					{
						CLSID: "{60CC734F-0AFA-4E2E-82B8-93B941AB11CF}",
						num: 2,
					},
					{
						CLSID: "{6D21ECEA-F85B-4E8D-9D51-31DC9B8AA4EF}",
						num: 3,
					},
					{
						CLSID: "{8D399DDA-FF81-4F14-904D-099B34FE7918}",
						num: 4,
					},
					{
						CLSID: "{8B9E3FD0-F034-4A07-B6CE-C269884CC71B}",
						num: 5,
					},
					{
						CLSID: "{8D399DDA-FF81-4F14-904D-099B34FE7918}",
						num: 6,
					},
					{
						CLSID: "<CLEAN>",
						num: 7,
					},
					{
						CLSID: "{60CC734F-0AFA-4E2E-82B8-93B941AB11CF}",
						num: 8,
					},
					{
						CLSID: "{1C97B4A0-AA3B-43A8-8EE7-D11071457185}",
						num: 9,
					},
				],
			},
		],
	},
	"F-5E-3": {
		chaff: 30,
		display_name: "F-5E",
		flare: 15,
		max_fuel: 2046,
		max_height: 16154,
		max_speed: 1742.4,
		name: "F-5E-3",
		availableTasks: ["CAP", "Escort", "Intercept"],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 174.72222222222,
		maxWaypoints: 3,
		era: "Early CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "AIM_54_Mk60*4",
				displayName: "AIM_54_Mk60*4",
				pylons: [
					{ CLSID: "{AIM-9B}", num: 1 },
					{
						CLSID: "<CLEAN>",
						num: 2,
					},
					{ CLSID: "{PTB-150GAL}", num: 3 },
					{ CLSID: "{PTB-150GAL}", num: 4 },
					{ CLSID: "{PTB-150GAL}", num: 5 },
					{
						CLSID: "<CLEAN>",
						num: 6,
					},
					{ CLSID: "{AIM-9B}", num: 7 },
				],
			},
		],
	},
	"F-14A-135-GR": {
		chaff: 140,
		display_name: "F-14A",
		flare: 60,
		max_fuel: 7348,
		max_height: 17000,
		max_speed: 2520,
		name: "F-14A-135-GR",
		availableTasks: ["CAP", "Escort", "Ground Attack", "Intercept", "Pinpoint Strike", "CAS"],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		maxWaypoints: 3,
		era: "Late CW",
		carrierCapable: true,
		AddPropAircraft: {
			INSAlignmentStored: true,
		},
		loadouts: [
			{
				task: "default",
				name: "AIM_54_Mk47*4",
				displayName: "AIM_54_Mk47*4",
				pylons: [
					{ CLSID: "{LAU-138 wtip - AIM-9L}", num: 1 },
					{ CLSID: "{SHOULDER AIM-7F}", num: 2 },
					{ CLSID: "{F14-300gal}", num: 3 },
					{ CLSID: "{AIM_54A_Mk47}", num: 4 },
					{ CLSID: "{AIM_54A_Mk47}", num: 5 },
					{ CLSID: "{AIM_54A_Mk47}", num: 6 },
					{ CLSID: "{AIM_54A_Mk47}", num: 7 },
					{ CLSID: "{F14-300gal}", num: 8 },
					{ CLSID: "{SHOULDER AIM-7F}", num: 9 },
					{ CLSID: "{LAU-138 wtip - AIM-9L}", num: 10 },
				],
			},
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "{LAU-138 wtip - AIM-9M}",
						num: 1,
					},
					{
						CLSID: "{SHOULDER AIM-7M}",
						num: 2,
					},
					{
						CLSID: "{F14-300gal}",
						num: 3,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 4,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 5,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 6,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 7,
					},
					{
						CLSID: "{F14-300gal}",
						num: 8,
					},
					{
						CLSID: "{F14-LANTIRN-TP}",
						num: 9,
					},
					{
						CLSID: "{LAU-138 wtip - AIM-9M}",
						num: 10,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{LAU-138 wtip - AIM-9M}",
						num: 1,
					},
					{
						CLSID: "{SHOULDER AIM-7M}",
						num: 2,
					},
					{
						CLSID: "{F14-300gal}",
						num: 3,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 4,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 5,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 6,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 7,
					},
					{
						CLSID: "{F14-300gal}",
						num: 8,
					},
					{
						CLSID: "{F14-LANTIRN-TP}",
						num: 9,
					},
					{
						CLSID: "{LAU-138 wtip - AIM-9M}",
						num: 10,
					},
				],
			},
		],
	},
	"F-14B": {
		chaff: 140,
		display_name: "F-14B",
		flare: 60,
		max_fuel: 7348,
		max_height: 17000,
		max_speed: 2520,
		name: "F-14B",
		availableTasks: ["CAP", "Escort", "Ground Attack", "Intercept", "Pinpoint Strike", "CAS"],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		maxWaypoints: 3,
		era: "Late CW",
		carrierCapable: true,
		AddPropAircraft: {
			INSAlignmentStored: true,
		},
		loadouts: [
			{
				task: "default",
				name: "AIM_54_Mk60*4",
				displayName: "AIM_54_Mk60*4",
				pylons: [
					{ CLSID: "{LAU-138 wtip - AIM-9M}", num: 1 },
					{ CLSID: "{SHOULDER AIM-7M}", num: 2 },
					{ CLSID: "{F14-300gal}", num: 3 },
					{ CLSID: "{AIM_54C_Mk60}", num: 4 },
					{ CLSID: "{AIM_54C_Mk60}", num: 5 },
					{ CLSID: "{AIM_54C_Mk60}", num: 6 },
					{ CLSID: "{AIM_54C_Mk60}", num: 7 },
					{ CLSID: "{F14-300gal}", num: 8 },
					{ CLSID: "{SHOULDER AIM-7M}", num: 9 },
					{ CLSID: "{LAU-138 wtip - AIM-9M}", num: 10 },
				],
			},
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "{LAU-138 wtip - AIM-9M}",
						num: 1,
					},
					{
						CLSID: "{SHOULDER AIM-7M}",
						num: 2,
					},
					{
						CLSID: "{F14-300gal}",
						num: 3,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 4,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 5,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 6,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 7,
					},
					{
						CLSID: "{F14-300gal}",
						num: 8,
					},
					{
						CLSID: "{F14-LANTIRN-TP}",
						num: 9,
					},
					{
						CLSID: "{LAU-138 wtip - AIM-9M}",
						num: 10,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{LAU-138 wtip - AIM-9M}",
						num: 1,
					},
					{
						CLSID: "{SHOULDER AIM-7M}",
						num: 2,
					},
					{
						CLSID: "{F14-300gal}",
						num: 3,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 4,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 5,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 6,
					},
					{
						CLSID: "{BRU-32 GBU-12}",
						num: 7,
					},
					{
						CLSID: "{F14-300gal}",
						num: 8,
					},
					{
						CLSID: "{F14-LANTIRN-TP}",
						num: 9,
					},
					{
						CLSID: "{LAU-138 wtip - AIM-9M}",
						num: 10,
					},
				],
			},
		],
	},
	"F-15C": {
		chaff: 120,
		display_name: "F-15C",
		flare: 60,
		max_fuel: 6103,
		max_height: 19700,
		max_speed: 2650,
		name: "F-15C",
		availableTasks: ["CAP", "Fighter Sweep", "Escort"],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		era: "Late CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "AIM-120",
				displayName: "AIM-120",
				pylons: [
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 1,
					},
					{
						CLSID: "{E1F29B21-F291-4589-9FD8-3272EEC69506}",
						num: 2,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 3,
					},
					{
						CLSID: "{C8E06185-7CD6-4C90-959F-044679E90751}",
						num: 4,
					},
					{
						CLSID: "{C8E06185-7CD6-4C90-959F-044679E90751}",
						num: 5,
					},
					{
						CLSID: "{E1F29B21-F291-4589-9FD8-3272EEC69506}",
						num: 6,
					},
					{
						CLSID: "{C8E06185-7CD6-4C90-959F-044679E90751}",
						num: 7,
					},
					{
						CLSID: "{C8E06185-7CD6-4C90-959F-044679E90751}",
						num: 8,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 9,
					},
					{
						CLSID: "{E1F29B21-F291-4589-9FD8-3272EEC69506}",
						num: 10,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 11,
					},
				],
			},
		],
	},
	"F-15ESE": {
		chaff: 120,
		display_name: "F-15E",
		flare: 60,
		max_fuel: 10245.529841878,
		max_height: 18300,
		max_speed: 2649.996,
		name: "F-15ESE",
		availableTasks: [
			"CAP",
			"Escort",
			"Ground Attack",
			"CAS",
			"Intercept",
			"Pinpoint Strike",
			"Fighter Sweep",
			"Runway Attack",
		],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		era: "Modern",
		carrierCapable: false,
		loadouts: [
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 1,
					},
					{
						CLSID: "{F15E_EXTTANK}",
						num: 2,
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 3,
					},
					{
						CLSID: "{CFT_L_GBU_12_x_4}",
						num: 4,
					},
					{
						CLSID: "<CLEAN>",
						num: 5,
					},
					{
						CLSID: "<CLEAN>",
						num: 6,
					},
					{
						CLSID: "{F-15E_AAQ-14_LANTIRN}",
						num: 7,
					},
					{
						CLSID: "<CLEAN>",
						num: 8,
					},
					{
						CLSID: "{F-15E_AAQ-13_LANTIRN}",
						num: 9,
					},
					{
						CLSID: "<CLEAN>",
						num: 10,
					},
					{
						CLSID: "<CLEAN>",
						num: 11,
					},
					{
						CLSID: "{CFT_R_GBU_10_x_2}",
						num: 12,
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 13,
					},
					{
						CLSID: "{F15E_EXTTANK}",
						num: 14,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 15,
					},
				],
			},
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 1,
					},
					{
						CLSID: "{F15E_EXTTANK}",
						num: 2,
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 3,
					},
					{
						CLSID: "{CFT_L_GBU_12_x_4}",
						num: 4,
					},
					{
						CLSID: "<CLEAN>",
						num: 5,
					},
					{
						CLSID: "<CLEAN>",
						num: 6,
					},
					{
						CLSID: "{F-15E_AAQ-14_LANTIRN}",
						num: 7,
					},
					{
						CLSID: "{DB769D48-67D7-42ED-A2BE-108D566C8B1E}",
						num: 8,
					},
					{
						CLSID: "{F-15E_AAQ-13_LANTIRN}",
						num: 9,
					},
					{
						CLSID: "<CLEAN>",
						num: 10,
					},
					{
						CLSID: "<CLEAN>",
						num: 11,
					},
					{
						CLSID: "{CFT_R_GBU_12_x_4}",
						num: 12,
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
						num: 13,
					},
					{
						CLSID: "{F15E_EXTTANK}",
						num: 14,
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
						num: 15,
					},
				],
			},
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
					},
					{
						CLSID: "{F15E_EXTTANK}",
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
					},
					{
						CLSID: "{40EF17B7-F508-45de-8566-6FFECC0C1AB8}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
					},
					{
						CLSID: "{F15E_EXTTANK}",
					},
					{
						CLSID: "{6CEB49FC-DED8-4DED-B053-E1F033FF72D3}",
					},
				],
			},
		],
	},
	"F-86F Sabre": {
		chaff: 0,
		display_name: "F-86F",
		flare: 0,
		max_fuel: 1282,
		max_height: 15100,
		max_speed: 964.8,
		name: "F-86F Sabre",
		availableTasks: ["CAP", "Fighter Sweep", "Intercept", "Escort", "Pinpoint Strike", "Ground Attack", "CAS"],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 3000,
		cruiseSpeed: 174.72222222222,
		era: "Korea",
		isHelicopter: false,
		loadouts: [
			{
				task: "default",
				name: "Default",
				displayName: "Default",
				pylons: [
					{
						CLSID: "<CLEAN>",
						num: 1,
					},
					{
						CLSID: "<CLEAN>",
						num: 2,
					},
					{
						CLSID: "<CLEAN>",
						num: 3,
					},
					{
						CLSID: "{PTB_120_F86F35}",
						num: 4,
					},
					{
						CLSID: "{GAR-8}",
						num: 5,
					},
					{
						CLSID: "{GAR-8}",
						num: 6,
					},
					{
						CLSID: "{PTB_120_F86F35}",
						num: 7,
					},
				],
			},
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "{PTB_200_F86F35}",
						num: 1,
					},
					{
						CLSID: "{HVARx2}",
						num: 2,
					},
					{
						CLSID: "{HVARx2}",
						num: 3,
					},
					{
						CLSID: "{HVARx2}",
						num: 4,
					},
					{
						CLSID: "<CLEAN>",
						num: 5,
					},
					{
						CLSID: "<CLEAN>",
						num: 6,
					},
					{
						CLSID: "{HVARx2}",
						num: 7,
					},
					{
						CLSID: "{HVARx2}",
						num: 8,
					},
					{
						CLSID: "{HVARx2}",
						num: 9,
					},
					{
						CLSID: "{PTB_200_F86F35}",
						num: 10,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{PTB_200_F86F35}",
						num: 1,
					},
					{
						CLSID: "<CLEAN>",
						num: 2,
					},
					{
						CLSID: "<CLEAN>",
						num: 3,
					},
					{
						CLSID: "{F86ANM64}",
						num: 4,
					},
					{
						CLSID: "<CLEAN>",
						num: 5,
					},
					{
						CLSID: "<CLEAN>",
						num: 6,
					},
					{
						CLSID: "{F86ANM64}",
						num: 7,
					},
					{
						CLSID: "<CLEAN>",
						num: 8,
					},
					{
						CLSID: "<CLEAN>",
						num: 9,
					},
					{
						CLSID: "{PTB_200_F86F35}",
						num: 10,
					},
				],
			},
		],
	},
	"Mirage-F1CE": {
		chaff: 30,
		display_name: "Mirage F1CE",
		flare: 15,
		max_fuel: 3356,
		max_height: 15240,
		max_speed: 1390,
		name: "Mirage-F1CE",
		availableTasks: ["CAP", "Fighter Sweep", "Intercept", "Pinpoint Strike", "Ground Attack", "Escort"],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		era: "Early CW",
		isHelicopter: false,
		AddPropAircraft: {
			RadarCoverSettings: 1,
			RocketSalvoF1: 1,
			GunBurstSettings: 1,
			MissSimplLock: 1,
			ChaffMultiTime: 1,
			FlareMultiNumber: 1,
			ChaffMultiNumber: 1,
			RocketSalvoF4: 1,
			ChaffProgramNumber: 1,
			LaserCode100: 6,
			LaserCode1: 8,
			ChaffProgramTime: 1,
			FlareMultiTime: 1,
			LaserCode10: 8,
			RWR_type: "ALR_300",
			INSStartMode: 1,
		},
		loadouts: [
			{
				task: "default",
				name: "Default",
				displayName: "Default",
				pylons: [
					{ CLSID: "{AIM-9JULI}", num: 1 },
					{
						CLSID: "<CLEAN>",
						num: 2,
					},
					{ CLSID: "{R530F_EM}", num: 3 },
					{ CLSID: "PTB-1200-F1", num: 4 },
					{ CLSID: "{R530F_EM}", num: 5 },
					{
						CLSID: "<CLEAN>",
						num: 6,
					},
					{ CLSID: "{AIM-9JULI}", num: 7 },
				],
			},
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "{AIM-9JULI}",
						num: 1,
					},
					{
						CLSID: "{MATRA_F1_SNEBT253}",
						num: 2,
					},
					{
						CLSID: "{MATRA_F1_SNEBT253}",
						num: 3,
					},
					{
						CLSID: "<CLEAN>",
						num: 4,
					},
					{
						CLSID: "{MATRA_F1_SNEBT253}",
						num: 5,
					},
					{
						CLSID: "{MATRA_F1_SNEBT253}",
						num: 6,
					},
					{
						CLSID: "{AIM-9JULI}",
						num: 7,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{AIM-9JULI}",
						num: 1,
					},
					{
						CLSID: "{SAMP400LD}",
						num: 2,
					},
					{
						CLSID: "{SAMP400LD}",
						num: 3,
					},
					{
						CLSID: "{CLB4_SAMP400LD}",
						num: 4,
					},
					{
						CLSID: "{SAMP400LD}",
						num: 5,
					},
					{
						CLSID: "{SAMP400LD}",
						num: 6,
					},
					{
						CLSID: "{AIM-9JULI}",
						num: 7,
					},
				],
			},
			{
				task: "SEAD",
				name: "SEAD",
				displayName: "SEAD",
				pylons: [
					{
						CLSID: "{AIM-9JULI}",
						num: 1,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 2,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 3,
					},
					{
						CLSID: "<CLEAN>",
						num: 4,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 5,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 6,
					},
					{
						CLSID: "{AIM-9JULI}",
						num: 7,
					},
				],
			},
			{
				task: "DEAD",
				name: "DEAD",
				displayName: "DEAD",
				pylons: [
					{
						CLSID: "{AIM-9JULI}",
						num: 1,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 2,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 3,
					},
					{
						CLSID: "<CLEAN>",
						num: 4,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 5,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 6,
					},
					{
						CLSID: "{AIM-9JULI}",
						num: 7,
					},
				],
			},
		],
	},
	"Mirage-F1EE": {
		chaff: 30,
		display_name: "Mirage F1EE",
		flare: 15,
		max_fuel: 3356,
		max_height: 15240,
		max_speed: 1390,
		name: "Mirage-F1EE",
		availableTasks: ["CAP", "Fighter Sweep", "Intercept", "Pinpoint Strike", "Ground Attack", "Escort"],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		era: "Late CW",
		isHelicopter: false,
		loadouts: [
			{
				task: "default",
				name: "Default",
				displayName: "Default",
				pylons: [
					{ CLSID: "{AIM-9JULI}", num: 1 },
					{
						CLSID: "<CLEAN>",
						num: 2,
					},
					{ CLSID: "{R530F_EM}", num: 3 },
					{ CLSID: "PTB-1200-F1", num: 4 },
					{ CLSID: "{R530F_EM}", num: 5 },
					{
						CLSID: "<CLEAN>",
						num: 6,
					},
					{ CLSID: "{AIM-9JULI}", num: 7 },
				],
			},
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "{AIM-9JULI}",
						num: 1,
					},
					{
						CLSID: "{MATRA_F1_SNEBT253}",
						num: 2,
					},
					{
						CLSID: "{MATRA_F1_SNEBT253}",
						num: 3,
					},
					{
						CLSID: "<CLEAN>",
						num: 4,
					},
					{
						CLSID: "{MATRA_F1_SNEBT253}",
						num: 5,
					},
					{
						CLSID: "{MATRA_F1_SNEBT253}",
						num: 6,
					},
					{
						CLSID: "{AIM-9JULI}",
						num: 7,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{AIM-9JULI}",
						num: 1,
					},
					{
						CLSID: "{SAMP400LD}",
						num: 2,
					},
					{
						CLSID: "{SAMP400LD}",
						num: 3,
					},
					{
						CLSID: "{CLB4_SAMP400LD}",
						num: 4,
					},
					{
						CLSID: "{SAMP400LD}",
						num: 5,
					},
					{
						CLSID: "{SAMP400LD}",
						num: 6,
					},
					{
						CLSID: "{AIM-9JULI}",
						num: 7,
					},
				],
			},
			{
				task: "SEAD",
				name: "SEAD",
				displayName: "SEAD",
				pylons: [
					{
						CLSID: "{AIM-9JULI}",
						num: 1,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 2,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 3,
					},
					{
						CLSID: "<CLEAN>",
						num: 4,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 5,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 6,
					},
					{
						CLSID: "{AIM-9JULI}",
						num: 7,
					},
				],
			},
			{
				task: "DEAD",
				name: "DEAD",
				displayName: "DEAD",
				pylons: [
					{
						CLSID: "{AIM-9JULI}",
						num: 1,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 2,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 3,
					},
					{
						CLSID: "<CLEAN>",
						num: 4,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 5,
					},
					{
						CLSID: "{MATRA_F1_SNEBT257}",
						num: 6,
					},
					{
						CLSID: "{AIM-9JULI}",
						num: 7,
					},
				],
			},
		],
	},
	"M-2000C": {
		chaff: 234,
		display_name: "M-2000C",
		flare: 64,
		max_fuel: 3165,
		max_height: 17526,
		max_speed: 2376,
		name: "M-2000C",
		availableTasks: ["CAP", "Fighter Sweep", "Intercept", "Pinpoint Strike", "Ground Attack", "Escort"],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		era: "Late CW",
		isHelicopter: false,
		loadouts: [
			{
				task: "default",
				name: "Default",
				displayName: "Default",
				pylons: [
					{ CLSID: "{MMagicII}", num: 1 },
					{ CLSID: "{M2KC_RAFAUT_MK82S}", num: 2 },
					{ CLSID: "{Mk82SNAKEYE}", num: 3 },
					{ CLSID: "{Mk82SNAKEYE}", num: 4 },
					{
						CLSID: "<CLEAN>",
						num: 5,
					},
					{ CLSID: "{Mk82SNAKEYE}", num: 6 },
					{ CLSID: "{Mk82SNAKEYE}", num: 7 },
					{ CLSID: "{M2KC_RAFAUT_MK82S}", num: 8 },
					{ CLSID: "{MMagicII}", num: 9 },
				],
			},
			{
				task: "CAP",
				name: "Default",
				displayName: "Default",
				pylons: [
					{ CLSID: "{MMagicII}", num: 1 },
					{ CLSID: "{Matra_S530D}", num: 2 },
					{ CLSID: "<CLEAN>", num: 3 },
					{ CLSID: "<CLEAN>", num: 4 },
					{
						CLSID: "{M2KC_RPL_522}",
						num: 5,
					},
					{ CLSID: "<CLEAN>", num: 6 },
					{ CLSID: "<CLEAN>", num: 7 },
					{ CLSID: "{Matra_S530D}", num: 8 },
					{ CLSID: "{MMagicII}", num: 9 },
				],
			},
			{
				task: "Escort",
				name: "Default",
				displayName: "Default",
				pylons: [
					{ CLSID: "{MMagicII}", num: 1 },
					{ CLSID: "{Matra_S530D}", num: 2 },
					{ CLSID: "<CLEAN>", num: 3 },
					{ CLSID: "<CLEAN>", num: 4 },
					{
						CLSID: "{M2KC_RPL_522}",
						num: 5,
					},
					{ CLSID: "<CLEAN>", num: 6 },
					{ CLSID: "<CLEAN>", num: 7 },
					{ CLSID: "{Matra_S530D}", num: 8 },
					{ CLSID: "{MMagicII}", num: 9 },
				],
			},
		],
	},
	"S-3B": {
		chaff: 30,
		display_name: "S-3B",
		flare: 30,
		max_fuel: 5500,
		max_height: 10700,
		max_speed: 840,
		name: "S-3B",
		availableTasks: ["Ground Attack", "Intercept"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 82.222222222222,
		era: "Late CW",
		carrierCapable: true,
		loadouts: [
			{
				task: "default",
				name: "AIM_54_Mk60*4",
				displayName: "AIM_54_Mk60*4",
				pylons: [
					{ CLSID: "{LAU-138 wtip - AIM-9M}", num: 1 },
					{ CLSID: "{SHOULDER AIM-7M}", num: 2 },
					{ CLSID: "{F14-300gal}", num: 3 },
					{ CLSID: "{AIM_54C_Mk60}", num: 4 },
					{ CLSID: "{AIM_54C_Mk60}", num: 5 },
					{ CLSID: "{AIM_54C_Mk60}", num: 6 },
					{ CLSID: "{AIM_54C_Mk60}", num: 7 },
					{ CLSID: "{F14-300gal}", num: 8 },
					{ CLSID: "{SHOULDER AIM-7M}", num: 9 },
					{ CLSID: "{LAU-138 wtip - AIM-9M}", num: 10 },
				],
			},
		],
	},
	"S-3B Tanker": {
		chaff: 30,
		display_name: "S-3B Tanker",
		flare: 30,
		max_fuel: 7813,
		max_height: 10700,
		max_speed: 840,
		name: "S-3B Tanker",
		availableTasks: ["Refueling"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 82.222222222222,
		era: "Late CW",
		carrierCapable: true,
		loadouts: [],
	},
	SA342L: {
		chaff: 0,
		display_name: "SA342L",
		flare: 32,
		max_fuel: 416.33,
		max_height: 6000,
		max_speed: 240,
		name: "SA342L",
		availableTasks: ["CSAR"],
		controllable: true,
		isHelicopter: true,
		cruiseAltitude: 150,
		cruiseSpeed: 46.25,
		era: "Late CW",
		carrierCapable: false,
		allowedFrequency: [120, 140],
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{
						CLSID: "{GIAT_M621_APHE}",
					},
					{
						CLSID: "{TELSON8_SNEBT251}",
					},
					{
						CLSID: "{FAS}",
					},
					{
						CLSID: "{IR_Deflector}",
					},
				],
			},
		],
	},
	SA342M: {
		chaff: 0,
		display_name: "SA342M",
		flare: 32,
		max_fuel: 416.33,
		max_height: 6000,
		max_speed: 240,
		name: "SA342M",
		availableTasks: ["CAS", "CSAR"],
		controllable: true,
		isHelicopter: true,
		allowedFrequency: [120, 140],
		cruiseAltitude: 150,
		cruiseSpeed: 120,
		era: "Late CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "Hot3x4",
				displayName: "Hot3x4",
				pylons: [
					{
						CLSID: "{HOT3_R2_M}",
					},
					{
						CLSID: "{HOT3_L2_M}",
					},
					{
						CLSID: "<CLEAN>",
					},
					{
						CLSID: "{IR_Deflector}",
					},
				],
			},
		],
	},
	"CH-47D": {
		chaff: 120,
		display_name: "CH-47D",
		flare: 120,
		max_fuel: 3600,
		max_height: 6750,
		max_speed: 300,
		name: "CH-47D",
		availableTasks: ["CSAR", "Transport", "Air Assault"],
		controllable: false,
		isHelicopter: true,
		cruiseAltitude: 150,
		cruiseSpeed: 46.25,
		era: "Early CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [],
			},
		],
	},
	"CH-53E": {
		chaff: 60,
		display_name: "CH-53E",
		flare: 60,
		max_fuel: 2880,
		max_height: 6200,
		max_speed: 310,
		name: "CH-53E",
		availableTasks: ["CSAR", "Transport", "Air Assault"],
		controllable: false,
		isHelicopter: true,
		cruiseAltitude: 150,
		cruiseSpeed: 46.25,
		era: "Late CW",
		carrierCapable: true,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [],
			},
		],
	},
	"SH-60B": {
		chaff: 30,
		display_name: "SH-60B",
		flare: 30,
		max_fuel: 1100,
		max_height: 5800,
		max_speed: 240,
		name: "SH-60B",
		availableTasks: ["Transport", "CSAR", "Air Assault"],
		controllable: false,
		isHelicopter: true,
		cruiseAltitude: 150,
		cruiseSpeed: 46.25,
		era: "Modern",
		carrierCapable: true,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [],
			},
		],
	},
	"UH-1H": {
		chaff: 0,
		display_name: "UH-1H",
		flare: 60,
		max_fuel: 631,
		max_height: 5000,
		max_speed: 200,
		name: "UH-1H",
		availableTasks: ["CSAR", "Ground Attack", "Transport", "Air Assault"],
		controllable: true,
		isHelicopter: true,
		cruiseAltitude: 150,
		cruiseSpeed: 46.25,
		era: "Korea",
		carrierCapable: true,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "M134_L", num: 1 },
					{ CLSID: "XM158_MK5", num: 2 },
					{ CLSID: "<CLEAN>", num: 2 },
					{ CLSID: "<CLEAN>", num: 3 },
					{ CLSID: "XM158_MK5", num: 5 },
					{ CLSID: "M134_R", num: 6 },
				],
			},
		],
	},
	"UH-60A": {
		chaff: 30,
		display_name: "UH-60A",
		flare: 30,
		max_fuel: 1100,
		max_height: 5800,
		max_speed: 300,
		name: "UH-60A",
		availableTasks: ["CSAR", "Transport", "Air Assault"],
		controllable: false,
		isHelicopter: true,
		cruiseAltitude: 150,
		cruiseSpeed: 61.73333,
		era: "Modern",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [],
			},
		],
	},
	"UH-60L": {
		chaff: 30,
		display_name: "UH-60L",
		flare: 30,
		max_fuel: 1100,
		max_height: 5800,
		max_speed: 300,
		name: "UH-60L",
		availableTasks: ["CSAR", "Transport", "Air Assault"],
		controllable: true,
		isHelicopter: true,
		cruiseAltitude: 150,
		cruiseSpeed: 61.73333,
		era: "Modern",
		carrierCapable: false,
		isMod: true,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [],
			},
		],
	},
	"AH-1W": {
		chaff: 30,
		display_name: "AH-1W Super Cobra",
		flare: 30,
		max_fuel: 1250,
		max_height: 5500,
		max_speed: 290,
		name: "AH-1W",
		availableTasks: ["CAS", "Ground Attack"],
		controllable: false,
		isHelicopter: true,
		cruiseAltitude: 150,
		cruiseSpeed: 61.73333,
		era: "Late CW",
		carrierCapable: false,
		isMod: true,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{3EA17AB0-A805-4D9E-8732-4CE00CB00F17}", num: 1 },
					{ CLSID: "M260_HYDRA", num: 2 },
					{ CLSID: "M260_HYDRA", num: 3 },
					{ CLSID: "{3EA17AB0-A805-4D9E-8732-4CE00CB00F17}", num: 4 },
				],
			},
		],
	},
	"AH-64D_BLK_II": {
		chaff: 30,
		display_name: "AH-64D BLK.II",
		flare: 60,
		ammo_type: 1,
		gun: 25,
		max_fuel: 1140,
		max_speed: 365,
		name: "AH-64D_BLK_II",
		max_height: 0,
		availableTasks: ["CAS", "Ground Attack"],
		controllable: true,
		cruiseAltitude: 1000,
		cruiseSpeed: 46.25,
		isHelicopter: true,
		era: "Late CW",
		carrierCapable: false,
		customCallsigns: [
			"Apache",
			"Crow",
			"Chaos",
			"Sioux",
			"Gatling",
			"Gunslinger",
			"Hammerhead",
			"Bootleg",
			"Palehorse",
			"Carnivore",
			"Saber",
		],
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{M261_OUTBOARD_AB_M151_E_M257}", num: 1 },
					{ CLSID: "{88D18A5E-99C8-4B04-B40B-1C02F2018B6E}", num: 2 },
					{ CLSID: "{88D18A5E-99C8-4B04-B40B-1C02F2018B6E}", num: 3 },
					{ CLSID: "{M261_OUTBOARD_AB_M151_E_M257}", num: 4 },
					{
						CLSID: "{IAFS_ComboPak_100}",
						num: 5,
					},
				],
			},
		],
	},
	"RQ-1A Predator": {
		chaff: 0,
		display_name: "MQ-1A Predator",
		flare: 0,
		max_fuel: 200,
		max_height: 8600,
		max_speed: 220,
		name: "RQ-1A Predator",
		availableTasks: ["AFAC"],
		carrierCapable: false,
		controllable: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 46.25,
		era: "Modern",
		isHelicopter: false,
		loadouts: [],
	},
	"E-2C": {
		chaff: 120,
		display_name: "E-2D",
		flare: 60,
		max_fuel: 5624,
		max_height: 9400,
		max_speed: 610,
		name: "E-2C",
		availableTasks: ["AWACS"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 133.61111111111,
		era: "Korea",
		carrierCapable: true,
		isLarge: true,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [],
			},
		],
	},
	"E-3A": {
		chaff: 120,
		display_name: "E-3A",
		flare: 60,
		max_fuel: 65000,
		max_height: 13100,
		max_speed: 860,
		name: "E-3A",
		availableTasks: ["AWACS"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Korea",
		carrierCapable: false,
		isLarge: true,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [],
			},
		],
	},
	"A-50": {
		chaff: 192,
		display_name: "A-50",
		flare: 192,
		max_fuel: 70000,
		max_height: 12000,
		max_speed: 850,
		name: "A-50",
		availableTasks: ["AWACS"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Korea",
		carrierCapable: false,
		isLarge: true,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [],
			},
		],
	},
	"MiG-15bis": {
		chaff: 0,
		display_name: "MiG-15bis",
		flare: 0,
		max_fuel: 1172,
		max_height: 15100,
		max_speed: 992,
		name: "MiG-15bis",
		availableTasks: ["CAP", "Escort", "Fighter Sweep"],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Korea",
		isHelicopter: false,
		allowedFrequency: [3.75, 5],
		loadouts: [
			{
				task: "default",
				displayName: "Default",
				name: "Default",
				pylons: [
					{
						CLSID: "PTB300_MIG15",
						num: 1,
					},
					{
						CLSID: "PTB300_MIG15",
						num: 2,
					},
				],
			},
		],
	},
	"MiG-19P": {
		chaff: 0,
		display_name: "MiG-19P",
		flare: 0,
		max_fuel: 1800,
		max_height: 17500,
		max_speed: 992,
		name: "MiG-19P",
		availableTasks: ["CAP", "Escort", "Fighter Sweep", "CAS", "Pinpoint Strike"],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Korea",
		isHelicopter: false,
		allowedFrequency: [100, 140],
		loadouts: [
			{
				task: "default",
				displayName: "Default",
				name: "Default",
				pylons: [
					{
						CLSID: "{K-13A}",
						num: 1,
					},
					{
						CLSID: "PTB760_MIG19",
						num: 2,
					},
					{
						CLSID: "<CLEAN>",
						num: 3,
					},
					{
						CLSID: "<CLEAN>",
						num: 4,
					},
					{
						CLSID: "PTB760_MIG19",
						num: 5,
					},
					{
						CLSID: "{K-13A}",
						num: 6,
					},
				],
			},
			{
				task: "CAS",
				displayName: "CAS",
				name: "CAS",
				pylons: [
					{
						CLSID: "<CLEAN>",
						num: 1,
					},
					{
						CLSID: "{3C612111-C7AD-476E-8A8E-2485812F4E5C}",
						num: 2,
					},
					{
						CLSID: "{ORO57K_S5M_HEFRAG}",
						num: 3,
					},
					{
						CLSID: "{ORO57K_S5M_HEFRAG}",
						num: 4,
					},
					{
						CLSID: "{3C612111-C7AD-476E-8A8E-2485812F4E5C}",
						num: 5,
					},
				],
			},
			{
				task: "CAS",
				displayName: "CAS",
				name: "CAS",
				pylons: [
					{
						CLSID: "<CLEAN>",
						num: 1,
					},
					{
						CLSID: "{3C612111-C7AD-476E-8A8E-2485812F4E5C}",
						num: 2,
					},
					{
						CLSID: "{ORO57K_S5M_HEFRAG}",
						num: 3,
					},
					{
						CLSID: "{ORO57K_S5M_HEFRAG}",
						num: 4,
					},
					{
						CLSID: "{3C612111-C7AD-476E-8A8E-2485812F4E5C}",
						num: 5,
					},
				],
			},
		],
	},
	"MiG-21Bis": {
		chaff: 18,
		display_name: "MiG-21Bis",
		flare: 40,
		max_fuel: 2280,
		max_height: 20000,
		max_speed: 2509.2,
		name: "MiG-21Bis",
		availableTasks: ["CAP", "Escort", "Intercept", "CAS", "Pinpoint Strike"],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Early CW",
		carrierCapable: false,
		allowedFrequency: [118, 140],
		loadouts: [
			{
				task: "default",
				name: "Patrol, medium range",
				displayName: "Patrol, medium range",
				pylons: [
					{
						CLSID: "{R-60 2L}",
						num: 1,
					},
					{
						CLSID: "{R-3R}",
						num: 2,
					},
					{
						CLSID: "{PTB_800_MIG21}",
						num: 3,
					},
					{
						CLSID: "{R-3R}",
						num: 4,
					},
					{
						CLSID: "{R-60 2R}",
						num: 5,
					},
					{
						CLSID: "{ASO-2}",
						num: 6,
					},
				],
			},
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "{UB-16_S5M}",
						num: 1,
					},
					{
						CLSID: "{08164777-5E9C-4B08-B48E-5AA7AFB246E2}",
						num: 2,
					},
					{
						CLSID: "{PTB_800_MIG21}",
						num: 3,
					},
					{
						CLSID: "{08164777-5E9C-4B08-B48E-5AA7AFB246E2}",
						num: 4,
					},
					{
						CLSID: "{UB-16_S5M}",
						num: 5,
					},
					{
						CLSID: "{ASO-2}",
						num: 6,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{3C612111-C7AD-476E-8A8E-2485812F4E5C}",
						num: 1,
					},
					{
						CLSID: "{3C612111-C7AD-476E-8A8E-2485812F4E5C}",
						num: 2,
					},
					{
						CLSID: "{PTB_800_MIG21}",
						num: 3,
					},
					{
						CLSID: "{3C612111-C7AD-476E-8A8E-2485812F4E5C}",
						num: 4,
					},
					{
						CLSID: "{3C612111-C7AD-476E-8A8E-2485812F4E5C}",
						num: 5,
					},
					{
						CLSID: "{ASO-2}",
						num: 6,
					},
				],
			},
		],
	},
	"MiG-23MLD": {
		chaff: 60,
		display_name: "MiG-23MLD",
		flare: 60,
		max_fuel: 3800,
		max_height: 18600,
		max_speed: 2500,
		name: "MiG-23MLD",
		availableTasks: ["CAP", "Escort", "Intercept"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Early CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "Patrol, medium range",
				displayName: "Patrol, medium range",
				pylons: [
					{
						CLSID: "<CLEAN>",
						num: 1,
					},
					{ CLSID: "{CCF898C9-5BC7-49A4-9D1E-C3ED3D5166A1}", num: 2 },
					{ CLSID: "{B0DBC591-0F52-4F7D-AD7B-51E67725FB81}", num: 3 },
					{ CLSID: "{A5BAEAB7-6FAF-4236-AF72-0FD900F493F9}", num: 4 },
					{ CLSID: "{275A2855-4A79-4B2D-B082-91EA2ADF4691}", num: 5 },
					{ CLSID: "{CCF898C9-5BC7-49A4-9D1E-C3ED3D5166A1}", num: 6 },
				],
			},
		],
	},
	"MiG-25PD": {
		chaff: 64,
		display_name: "MiG-25PD",
		flare: 64,
		max_fuel: 15245,
		max_height: 20000,
		max_speed: 3000,
		name: "MiG-25PD",
		availableTasks: ["CAP", "Escort", "Intercept"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		era: "Late CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "Patrol, medium range",
				displayName: "Patrol, medium range",
				pylons: [
					{ CLSID: "{5F26DBC2-FB43-4153-92DE-6BBCE26CB0FF}", num: 1 },
					{ CLSID: "{4EDBA993-2E34-444C-95FB-549300BF7CAF}", num: 2 },
					{ CLSID: "{4EDBA993-2E34-444C-95FB-549300BF7CAF}", num: 3 },
					{ CLSID: "{5F26DBC2-FB43-4153-92DE-6BBCE26CB0FF}", num: 4 },
				],
			},
		],
	},
	"MiG-29A": {
		chaff: 30,
		display_name: "MiG-29A",
		flare: 30,
		max_fuel: 3376,
		max_height: 18000,
		max_speed: 2450,
		name: "MiG-29A",
		availableTasks: ["CAP", "Escort", "Intercept", "Fighter Sweep", "Pinpoint Strike"],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Late CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "R-73*4, R27R*2, Fuel-1500",
				displayName: "R-73*4, R27R*2, Fuel-1500",
				pylons: [
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
						num: 1,
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
						num: 2,
					},
					{
						CLSID: "{9B25D316-0434-4954-868F-D51DB1A38DF0}",
						num: 3,
					},
					{
						CLSID: "{2BEC576B-CDF5-4B7F-961F-B0FA4312B841}",
						num: 4,
					},
					{
						CLSID: "{9B25D316-0434-4954-868F-D51DB1A38DF0}",
						num: 5,
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
						num: 6,
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
						num: 7,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
						num: 1,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 2,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 3,
					},
					{
						CLSID: "{2BEC576B-CDF5-4B7F-961F-B0FA4312B841}",
						num: 4,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 5,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 6,
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
						num: 7,
					},
				],
			},
		],
	},
	"Su-17M4": {
		chaff: 64,
		display_name: "Su-17M4",
		flare: 64,
		max_fuel: 3770,
		max_height: 14000,
		max_speed: 1860,
		name: "Su-17M4",
		availableTasks: ["CAS", "Ground Attack", "Pinpoint Strike", "DEAD"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 3048,
		cruiseSpeed: 174.72222222222,
		era: "Early CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				displayName: "default",
				name: "default",
				pylons: [
					{ CLSID: "{F72F47E5-C83A-4B85-96ED-D3E46671EE9A}", num: 1 },
					{ CLSID: "{APU-60-1_R_60M}", num: 2 },
					{ CLSID: "{F72F47E5-C83A-4B85-96ED-D3E46671EE9A}", num: 3 },
					{ CLSID: "{E659C4BE-2CD8-4472-8C08-3F28ACB61A8A}", num: 4 },
					{ CLSID: "{E659C4BE-2CD8-4472-8C08-3F28ACB61A8A}", num: 5 },
					{ CLSID: "{F72F47E5-C83A-4B85-96ED-D3E46671EE9A}", num: 6 },
					{ CLSID: "{APU-60-1_R_60M}", num: 7 },
					{ CLSID: "{F72F47E5-C83A-4B85-96ED-D3E46671EE9A}", num: 8 },
				],
			},
			{
				task: "Pinpoint Strike",
				displayName: "Pinpoint Strike",
				name: "Pinpoint Strike",
				pylons: [
					{ CLSID: "{E659C4BE-2CD8-4472-8C08-3F28ACB61A8A}", num: 1 },
					{ CLSID: "{APU-60-1_R_60M}", num: 2 },
					{ CLSID: "{3E35F8C1-052D-11d6-9191-00A0249B6F00}", num: 3 },
					{ CLSID: "{E659C4BE-2CD8-4472-8C08-3F28ACB61A8A}", num: 4 },
					{ CLSID: "{E659C4BE-2CD8-4472-8C08-3F28ACB61A8A}", num: 5 },
					{ CLSID: "{3E35F8C1-052D-11d6-9191-00A0249B6F00}", num: 6 },
					{ CLSID: "{APU-60-1_R_60M}", num: 7 },
					{ CLSID: "{E659C4BE-2CD8-4472-8C08-3F28ACB61A8A}", num: 8 },
				],
			},
		],
	},
	"Su-25": {
		chaff: 128,
		display_name: "Su-25",
		flare: 128,
		max_fuel: 2835,
		max_height: 7000,
		max_speed: 980,
		name: "Su-25",
		availableTasks: ["CAS", "Ground Attack", "Pinpoint Strike"],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 3048,
		cruiseSpeed: 174.72222222222,
		era: "Early CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				displayName: "RBK-250*4, S-8KOM*80, R-60M*2",
				name: "RBK-250*4, S-8KOM*80, R-60M*2",
				pylons: [
					{ CLSID: "{682A481F-0CB5-4693-A382-D00DD4A156D7}", num: 1 },
					{ CLSID: "{F72F47E5-C83A-4B85-96ED-D3E46671EE9A}", num: 2 },
					{ CLSID: "{F72F47E5-C83A-4B85-96ED-D3E46671EE9A}", num: 3 },
					{ CLSID: "{4203753F-8198-4E85-9924-6F8FF679F9FF}", num: 4 },
					{ CLSID: "{4203753F-8198-4E85-9924-6F8FF679F9FF}", num: 5 },
					{ CLSID: "{4203753F-8198-4E85-9924-6F8FF679F9FF}", num: 6 },
					{ CLSID: "{4203753F-8198-4E85-9924-6F8FF679F9FF}", num: 7 },
					{ CLSID: "{F72F47E5-C83A-4B85-96ED-D3E46671EE9A}", num: 8 },
					{ CLSID: "{F72F47E5-C83A-4B85-96ED-D3E46671EE9A}", num: 9 },
					{ CLSID: "{682A481F-0CB5-4693-A382-D00DD4A156D7}", num: 10 },
				],
			},
			{
				task: "Pinpoint Strike",
				displayName: "Strike",
				name: "Strike",
				pylons: [
					{
						CLSID: "{682A481F-0CB5-4693-A382-D00DD4A156D7}",
						num: 1,
					},
					{
						CLSID: "{0180F983-C14A-11d8-9897-000476191836}",
						num: 2,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 3,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 4,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 5,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 6,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 7,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 8,
					},
					{
						CLSID: "{0180F983-C14A-11d8-9897-000476191836}",
						num: 9,
					},
					{
						CLSID: "{682A481F-0CB5-4693-A382-D00DD4A156D7}",
						num: 10,
					},
				],
			},
		],
	},
	"IL-76MD": {
		chaff: 96,
		display_name: "IL-76MD",
		flare: 96,
		max_fuel: 80000,
		max_height: 12000,
		max_speed: 850,
		name: "IL-76MD",
		availableTasks: ["Transport"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Late CW",
		carrierCapable: false,
		loadouts: [],
	},
	"L-39ZA": {
		chaff: 0,
		display_name: "L-39ZA",
		flare: 0,
		max_fuel: 980,
		max_height: 11000,
		max_speed: 763.2,
		name: "L-39ZA",
		availableTasks: ["CAS", "Ground Attack"],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 133.61111111111,
		era: "Early CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{UB-16-57UMP}", num: 1 },
					{ CLSID: "{FAB-100x2}", num: 2 },
					{ CLSID: "<CLEAN>", num: 3 },
					{ CLSID: "{FAB-100x2}", num: 4 },
					{ CLSID: "{UB-16-57UMP}", num: 5 },
				],
			},
		],
	},
	"MiG-29S": {
		chaff: 30,
		display_name: "MiG-29S",
		flare: 30,
		max_fuel: 3493,
		max_height: 18000,
		max_speed: 2450,
		name: "MiG-29S",
		availableTasks: ["CAP", "Escort", "Intercept", "Fighter Sweep"],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Late CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}", num: 1 },
					{ CLSID: "{B4C01D60-A8A3-4237-BD72-CA7655BC0FE9}", num: 2 },
					{ CLSID: "{B4C01D60-A8A3-4237-BD72-CA7655BC0FE9}", num: 3 },
					{ CLSID: "{2BEC576B-CDF5-4B7F-961F-B0FA4312B841}", num: 4 },
					{ CLSID: "{B4C01D60-A8A3-4237-BD72-CA7655BC0FE9}", num: 5 },
					{ CLSID: "{B4C01D60-A8A3-4237-BD72-CA7655BC0FE9}", num: 6 },
					{ CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}", num: 7 },
				],
			},
		],
	},
	"MiG-31": {
		chaff: 0,
		display_name: "MiG-31",
		flare: 0,
		max_fuel: 15500,
		max_height: 20000,
		max_speed: 3000,
		name: "MiG-31",
		availableTasks: ["CAP", "Escort", "Intercept", "Fighter Sweep"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		era: "Late CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{5F26DBC2-FB43-4153-92DE-6BBCE26CB0FF}", num: 1 },
					{ CLSID: "{F1243568-8EF0-49D4-9CB5-4DA90D92BC1D}", num: 2 },
					{ CLSID: "{F1243568-8EF0-49D4-9CB5-4DA90D92BC1D}", num: 3 },
					{ CLSID: "{F1243568-8EF0-49D4-9CB5-4DA90D92BC1D}", num: 4 },
					{ CLSID: "{F1243568-8EF0-49D4-9CB5-4DA90D92BC1D}", num: 5 },
					{ CLSID: "{5F26DBC2-FB43-4153-92DE-6BBCE26CB0FF}", num: 6 },
				],
			},
		],
	},
	"Su-24M": {
		chaff: 96,
		display_name: "Su-24M",
		flare: 96,
		max_fuel: 11700,
		max_height: 16500,
		max_speed: 1700,
		name: "Su-24M",
		availableTasks: ["CAS", "Ground Attack", "Pinpoint Strike"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Early CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{ CLSID: "{E86C5AA5-6D49-4F00-AD2E-79A62D6DDE26}", num: 1 },
					{ CLSID: "{E86C5AA5-6D49-4F00-AD2E-79A62D6DDE26}", num: 2 },
					{ CLSID: "{F99BEC1A-869D-4AC7-9730-FBA0E3B1F5FC}", num: 3 },
					{ CLSID: "<CLEAN>", num: 4 },
					{ CLSID: "{16602053-4A12-40A2-B214-AB60D481B20E}", num: 5 },
					{ CLSID: "{F99BEC1A-869D-4AC7-9730-FBA0E3B1F5FC}", num: 6 },
					{ CLSID: "{E86C5AA5-6D49-4F00-AD2E-79A62D6DDE26}", num: 7 },
					{ CLSID: "{E86C5AA5-6D49-4F00-AD2E-79A62D6DDE26}", num: 8 },
				],
			},
			{
				task: "DEAD",
				name: "DEAD",
				displayName: "DEAD",
				pylons: [
					{
						CLSID: "{APU-60-1_R_60M}",
						num: 1,
					},
					{
						CLSID: "{4D13E282-DF46-4B23-864A-A9423DFDE504}",
						num: 2,
					},
					{
						CLSID: "{7AEC222D-C523-425e-B714-719C0D1EB14D}",
						num: 3,
					},
					{ CLSID: "<CLEAN>", num: 4 },
					{
						CLSID: "{0519A264-0AB6-11d6-9193-00A0249B6F00}",
						num: 5,
					},
					{
						CLSID: "{7AEC222D-C523-425e-B714-719C0D1EB14D}",
						num: 6,
					},
					{
						CLSID: "{D8F2C90B-887B-4B9E-9FE2-996BC9E9AF03}",
						num: 7,
					},
					{
						CLSID: "{APU-60-1_R_60M}",
						num: 8,
					},
				],
			},
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{APU-60-1_R_60M}", num: 1 },
					{ CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}", num: 2 },
					{ CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}", num: 3 },
					{ CLSID: "<CLEAN>", num: 4 },
					{ CLSID: "{16602053-4A12-40A2-B214-AB60D481B20E}", num: 5 },
					{ CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}", num: 6 },
					{ CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}", num: 7 },
					{ CLSID: "{APU-60-1_R_60M}", num: 8 },
				],
			},
		],
	},
	"Su-25T": {
		chaff: 128,
		display_name: "Su-25T",
		flare: 128,
		max_fuel: 3790,
		max_height: 7000,
		max_speed: 950,
		name: "Su-25T",
		availableTasks: ["CAS", "Ground Attack", "Pinpoint Strike", "SEAD", "DEAD"],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 174.72222222222,
		era: "Late CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82D}", num: 1 },
					{ CLSID: "{CBC29BFE-3D24-4C64-B81D-941239D12249}", num: 2 },
					{ CLSID: "{79D73885-0801-45a9-917F-C90FE1CE3DFC}", num: 3 },
					{ CLSID: "{F789E86A-EE2E-4E6B-B81E-D5E5F903B6ED}", num: 4 },
					{ CLSID: "{E92CBFE5-C153-11d8-9897-000476191836}", num: 5 },
					{ CLSID: "{B1EF6B0E-3D91-4047-A7A5-A99E7D8B4A8B}", num: 6 },
					{ CLSID: "{E92CBFE5-C153-11d8-9897-000476191836}", num: 7 },
					{ CLSID: "{F789E86A-EE2E-4E6B-B81E-D5E5F903B6ED}", num: 8 },
					{ CLSID: "{79D73885-0801-45a9-917F-C90FE1CE3DFC}", num: 9 },
					{ CLSID: "{CBC29BFE-3D24-4C64-B81D-941239D12249}", num: 10 },
					{ CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82C}", num: 11 },
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82D}",
					},
					{
						CLSID: "{CBC29BFE-3D24-4C64-B81D-941239D12249}",
					},
					{
						CLSID: "{79D73885-0801-45a9-917F-C90FE1CE3DFC}",
					},
					{
						CLSID: "{79D73885-0801-45a9-917F-C90FE1CE3DFC}",
					},
					{
						CLSID: "{D4A8D9B9-5C45-42e7-BBD2-0E54F8308432}",
					},
					{
						CLSID: "{B1EF6B0E-3D91-4047-A7A5-A99E7D8B4A8B}",
					},
					{
						CLSID: "{D4A8D9B9-5C45-42e7-BBD2-0E54F8308432}",
					},
					{
						CLSID: "{79D73885-0801-45a9-917F-C90FE1CE3DFC}",
					},
					{
						CLSID: "{79D73885-0801-45a9-917F-C90FE1CE3DFC}",
					},
					{
						CLSID: "{CBC29BFE-3D24-4C64-B81D-941239D12249}",
					},
					{
						CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82C}",
					},
				],
			},
			{
				task: "DEAD",
				name: "DEAD",
				displayName: "DEAD",
				pylons: [
					{
						CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82D}",
					},
					{
						CLSID: "{CBC29BFE-3D24-4C64-B81D-941239D12249}",
					},
					{
						CLSID: "{79D73885-0801-45a9-917F-C90FE1CE3DFC}",
					},
					{
						CLSID: "{752AF1D2-EBCC-4bd7-A1E7-2357F5601C70}",
					},
					{
						CLSID: "{B5CA9846-776E-4230-B4FD-8BCC9BFB1676}",
					},
					{
						CLSID: "{0519A264-0AB6-11d6-9193-00A0249B6F00}",
					},
					{
						CLSID: "{B5CA9846-776E-4230-B4FD-8BCC9BFB1676}",
					},
					{
						CLSID: "{752AF1D2-EBCC-4bd7-A1E7-2357F5601C70}",
					},
					{
						CLSID: "{79D73885-0801-45a9-917F-C90FE1CE3DFC}",
					},
					{
						CLSID: "{CBC29BFE-3D24-4C64-B81D-941239D12249}",
					},
					{
						CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82C}",
					},
				],
			},
		],
	},
	"Su-27": {
		chaff: 96,
		display_name: "Su-27",
		flare: 96,
		max_fuel: 9400,
		max_height: 18500,
		max_speed: 2500,
		name: "Su-27",
		availableTasks: ["CAP", "Escort", "Intercept", "Fighter Sweep", "Pinpoint Strike"],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		era: "Modern",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82F}", num: 1 },
					{ CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}", num: 2 },
					{ CLSID: "{B79C379A-9E87-4E50-A1EE-7F7E29C2E87A}", num: 3 },
					{ CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}", num: 4 },
					{ CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}", num: 5 },
					{ CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}", num: 6 },
					{ CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}", num: 7 },
					{ CLSID: "{B79C379A-9E87-4E50-A1EE-7F7E29C2E87A}", num: 8 },
					{ CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}", num: 9 },
					{ CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82A}", num: 10 },
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82F}",
						num: 1,
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
						num: 2,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 3,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 4,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 5,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 6,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 7,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 8,
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
						num: 9,
					},
					{
						CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82A}",
						num: 10,
					},
				],
			},
		],
	},
	"Su-30": {
		chaff: 96,
		display_name: "Su-30",
		flare: 96,
		max_fuel: 9400,
		max_height: 17300,
		max_speed: 2200,
		name: "Su-30",
		availableTasks: ["CAP", "Escort", "Intercept", "Fighter Sweep"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		era: "Modern",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{
						CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82F}",
						num: 1,
					},
					{
						CLSID: "{B4C01D60-A8A3-4237-BD72-CA7655BC0FE9}",
						num: 2,
					},
					{
						CLSID: "{B79C379A-9E87-4E50-A1EE-7F7E29C2E87A}",
						num: 3,
					},
					{
						CLSID: "{B4C01D60-A8A3-4237-BD72-CA7655BC0FE9}",
						num: 4,
					},
					{
						CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}",
						num: 5,
					},
					{
						CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}",
						num: 6,
					},
					{
						CLSID: "{B4C01D60-A8A3-4237-BD72-CA7655BC0FE9}",
						num: 7,
					},
					{
						CLSID: "{B79C379A-9E87-4E50-A1EE-7F7E29C2E87A}",
						num: 8,
					},
					{
						CLSID: "{B4C01D60-A8A3-4237-BD72-CA7655BC0FE9}",
						num: 9,
					},
					{
						CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82A}",
						num: 10,
					},
				],
			},
		],
	},
	"Su-33": {
		chaff: 48,
		display_name: "Su-33",
		flare: 48,
		max_fuel: 9500,
		max_height: 17000,
		max_speed: 2300,
		name: "Su-33",
		availableTasks: ["CAP", "Escort", "Intercept", "Fighter Sweep", "Pinpoint Strike"],
		controllable: true,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		era: "Modern",
		carrierCapable: true,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{
						CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82F}",
						num: 1,
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
						num: 2,
					},
					{
						CLSID: "{B79C379A-9E87-4E50-A1EE-7F7E29C2E87A}",
						num: 3,
					},
					{
						CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}",
						num: 4,
					},
					{
						CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}",
						num: 5,
					},
					{
						CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}",
						num: 6,
					},
					{
						CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}",
						num: 7,
					},
					{
						CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}",
						num: 8,
					},
					{
						CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}",
						num: 9,
					},
					{
						CLSID: "{B79C379A-9E87-4E50-A1EE-7F7E29C2E87A}",
						num: 10,
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
						num: 11,
					},
					{
						CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82A}",
						num: 12,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82F}",
						num: 1,
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
						num: 2,
					},
					{
						CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}",
						num: 3,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 4,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 5,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 6,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 7,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 8,
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
						num: 9,
					},
					{
						CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}",
						num: 10,
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
						num: 11,
					},
					{
						CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82A}",
						num: 12,
					},
				],
			},
		],
	},
	"Su-34": {
		chaff: 64,
		display_name: "Su-34",
		flare: 64,
		max_fuel: 9800,
		max_height: 15000,
		max_speed: 1900.008,
		name: "Su-34",
		availableTasks: ["CAS", "Ground Attack", "Pinpoint Strike", "SEAD", "DEAD"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Modern",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82F}", num: 1 },
					{ CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}", num: 2 },
					{ CLSID: "{X-29T}", num: 3 },
					{ CLSID: "{BA565F89-2373-4A84-9502-A0E017D3A44A}", num: 4 },
					{ CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}", num: 5 },
					{ CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}", num: 6 },
					{ CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}", num: 7 },
					{ CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}", num: 8 },
					{ CLSID: "{BA565F89-2373-4A84-9502-A0E017D3A44A}", num: 9 },
					{ CLSID: "{X-29T}", num: 10 },
					{ CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}", num: 11 },
					{ CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82A}", num: 12 },
				],
			},
			{
				task: "DEAD",
				name: "DEAD",
				displayName: "DEAD",
				pylons: [
					{
						CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82F}",
						num: 1,
					},
					{
						CLSID: "{B4C01D60-A8A3-4237-BD72-CA7655BC0FE9}",
						num: 2,
					},
					{
						CLSID: "{2234F529-1D57-4496-8BB0-0150F9BDBBD2}",
						num: 3,
					},
					{
						CLSID: "{2234F529-1D57-4496-8BB0-0150F9BDBBD2}",
						num: 4,
					},
					{
						CLSID: "{4203753F-8198-4E85-9924-6F8FF679F9FF}",
						num: 5,
					},
					{
						CLSID: "{E2C426E3-8B10-4E09-B733-9CDC26520F48}",
						num: 6,
					},
					{
						CLSID: "{E2C426E3-8B10-4E09-B733-9CDC26520F48}",
						num: 7,
					},
					{
						CLSID: "{4203753F-8198-4E85-9924-6F8FF679F9FF}",
						num: 8,
					},
					{
						CLSID: "{2234F529-1D57-4496-8BB0-0150F9BDBBD2}",
						num: 9,
					},
					{
						CLSID: "{2234F529-1D57-4496-8BB0-0150F9BDBBD2}",
						num: 10,
					},
					{
						CLSID: "{B4C01D60-A8A3-4237-BD72-CA7655BC0FE9}",
						num: 11,
					},
					{
						CLSID: "{44EE8698-89F9-48EE-AF36-5FD31896A82A}",
						num: 12,
					},
				],
			},
		],
	},
	"Tu-142": {
		chaff: 48,
		display_name: "Tu-142",
		flare: 48,
		max_fuel: 87000,
		max_height: 13500,
		max_speed: 860,
		name: "Tu-142",
		availableTasks: ["Antiship Strike"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Early CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [{ CLSID: "{C42EE4C3-355C-4B83-8B22-B39430B8F4AE}", num: 1 }],
			},
		],
	},
	"Tu-160": {
		chaff: 72,
		display_name: "Tu-160",
		flare: 72,
		max_fuel: 157000,
		max_height: 15600,
		max_speed: 2200,
		name: "Tu-160",
		availableTasks: [],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Modern",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{0290F5DE-014A-4BB1-9843-D717749B1DED}", num: 1 },
					{ CLSID: "{0290F5DE-014A-4BB1-9843-D717749B1DED}", num: 2 },
				],
			},
		],
	},
	"Tu-22M3": {
		chaff: 48,
		display_name: "Tu-22M3",
		flare: 48,
		max_fuel: 50000,
		max_height: 13300,
		max_speed: 2300,
		name: "Tu-22M3",
		availableTasks: ["Antiship Strike"],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 251.80555555556,
		era: "Modern",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{12429ECF-03F0-4DF6-BCBD-5D38B6343DE1}", num: 1 },
					{ CLSID: "<CLEAN>", num: 2 },
					{ CLSID: "<CLEAN>", num: 3 },
					{ CLSID: "<CLEAN>", num: 4 },
					{ CLSID: "{12429ECF-03F0-4DF6-BCBD-5D38B6343DE1}", num: 5 },
				],
			},
		],
	},
	"Tu-95MS": {
		chaff: 48,
		display_name: "Tu-95MS",
		flare: 48,
		max_fuel: 87000,
		max_height: 12000,
		max_speed: 830,
		name: "Tu-95MS",
		availableTasks: [],
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Korea",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [{ CLSID: "{0290F5DE-014A-4BB1-9843-D717749B1DED}", num: 1 }],
			},
		],
	},
	"Ka-50": {
		chaff: 0,
		display_name: "Ka-50",
		flare: 128,
		max_fuel: 1450,
		max_speed: 350,
		name: "Ka-50",
		max_height: 0,
		availableTasks: ["CAS"],
		controllable: true,
		cruiseAltitude: 1000,
		cruiseSpeed: 46.25,
		isHelicopter: true,
		era: "Modern",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{A6FD14D3-6D30-4C85-88A7-8D17BEE120E2}", num: 1 },
					{ CLSID: "{6A4B9E69-64FE-439a-9163-3A87FB6A4D81}", num: 2 },
					{ CLSID: "{6A4B9E69-64FE-439a-9163-3A87FB6A4D81}", num: 3 },
					{ CLSID: "{A6FD14D3-6D30-4C85-88A7-8D17BEE120E2}", num: 4 },
				],
			},
		],
	},
	"Ka-50_3": {
		chaff: 0,
		display_name: "Ka-50 III",
		flare: 128,
		max_fuel: 1450,
		max_speed: 350,
		name: "Ka-50_3",
		max_height: 0,
		availableTasks: ["CAS"],
		controllable: true,
		cruiseAltitude: 1000,
		cruiseSpeed: 46.25,
		isHelicopter: true,
		era: "Modern",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{A6FD14D3-6D30-4C85-88A7-8D17BEE120E2}", num: 1 },
					{ CLSID: "B_8V20A_OFP2", num: 2 },
					{ CLSID: "B_8V20A_OFP2", num: 3 },
					{ CLSID: "{A6FD14D3-6D30-4C85-88A7-8D17BEE120E2}", num: 4 },
					{ CLSID: "{9S846_2xIGLA}", num: 5 },
					{ CLSID: "{9S846_2xIGLA}", num: 6 },
				],
			},
		],
	},
	"Mi-24P": {
		chaff: 0,
		display_name: "Mi-24P Hind",
		flare: 192,

		max_fuel: 1701,
		max_speed: 330,
		name: "Mi-24P",
		max_height: 0,
		availableTasks: ["CAS", "CSAR", "Air Assault"],
		controllable: true,
		cruiseAltitude: 1000,
		cruiseSpeed: 46.25,
		isHelicopter: true,
		era: "Early CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{2x9M120_Ataka_V}", num: 1 },
					{ CLSID: "{2x9M120_Ataka_V}", num: 2 },
					{ CLSID: "{6A4B9E69-64FE-439a-9163-3A87FB6A4D81}", num: 3 },
					{ CLSID: "{6A4B9E69-64FE-439a-9163-3A87FB6A4D81}", num: 4 },
					{ CLSID: "{2x9M120_Ataka_V}", num: 5 },
					{ CLSID: "{2x9M120_Ataka_V}", num: 6 },
				],
			},
		],
	},
	"Mi-8MT": {
		chaff: 0,
		display_name: "Mi-8 Hip",
		flare: 128,

		max_fuel: 1929,
		max_height: 5000,
		max_speed: 250,
		name: "Mi-8MT",
		availableTasks: ["CSAR", "Transport", "Air Assault"],
		controllable: true,
		cruiseAltitude: 1000,
		cruiseSpeed: 46.25,
		isHelicopter: true,
		era: "Early CW",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "<CLEAN>", num: 1 },
					{ CLSID: "<CLEAN>", num: 2 },
					{ CLSID: "<CLEAN>", num: 3 },
					{ CLSID: "<CLEAN>", num: 4 },
					{ CLSID: "<CLEAN>", num: 5 },
					{ CLSID: "<CLEAN>", num: 6 },
					{
						CLSID: "KORD_12_7",
						num: 7,
					},
					{
						CLSID: "PKT_7_62",
						num: 8,
					},
				],
			},
			{
				task: "CSAR",
				name: "CSAR",
				displayName: "CSAR",
				pylons: [
					{ CLSID: "<CLEAN>", num: 1 },
					{ CLSID: "<CLEAN>", num: 2 },
					{ CLSID: "<CLEAN>", num: 3 },
					{ CLSID: "<CLEAN>", num: 4 },
					{ CLSID: "<CLEAN>", num: 5 },
					{ CLSID: "<CLEAN>", num: 6 },
					{
						CLSID: "KORD_12_7",
						num: 7,
					},
					{
						CLSID: "PKT_7_62",
						num: 8,
					},
				],
			},
		],
	},
	"Mi-28N": {
		chaff: 0,
		display_name: "Mi-28N",
		flare: 128,
		max_fuel: 1500,
		max_height: 5300,
		max_speed: 305,
		name: "Mi-28N",
		availableTasks: ["CAS"],
		controllable: false,
		cruiseAltitude: 1000,
		cruiseSpeed: 46.25,
		isHelicopter: true,
		era: "Modern",
		carrierCapable: false,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [
					{ CLSID: "{57232979-8B0F-4db7-8D9A-55197E06B0F5}", num: 1 },
					{ CLSID: "{6A4B9E69-64FE-439a-9163-3A87FB6A4D81}", num: 2 },
					{ CLSID: "{6A4B9E69-64FE-439a-9163-3A87FB6A4D81}", num: 3 },
					{ CLSID: "{57232979-8B0F-4db7-8D9A-55197E06B0F5}", num: 4 },
				],
			},
		],
	},
	"J-11A": {
		chaff: 96,
		display_name: "J-11A",
		flare: 96,
		max_fuel: 9400,
		max_height: 18500,
		max_speed: 2499.984,
		name: "J-11A",
		availableTasks: ["CAP", "CAS", "Pinpoint Strike", "Escort", "Intercept"],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Modern",
		isHelicopter: false,
		loadouts: [
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "{RKL609_L}",
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
					},
					{
						CLSID: "{B8M1_20_S8KOM_DUAL_L}",
					},
					{
						CLSID: "{7AEC222D-C523-425e-B714-719C0D1EB14D}",
					},
					{
						CLSID: "{D5435F26-F120-4FA3-9867-34ACE562EF1B}",
					},
					{
						CLSID: "{D5435F26-F120-4FA3-9867-34ACE562EF1B}",
					},
					{
						CLSID: "{7AEC222D-C523-425e-B714-719C0D1EB14D}",
					},
					{
						CLSID: "{B8M1_20_S8KOM_DUAL_R}",
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
					},
					{
						CLSID: "{RKL609_R}",
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{RKL609_L}",
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
					},
					{
						CLSID: "{FAB_250_DUAL_L}",
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
					},
					{
						CLSID: "{37DCC01E-9E02-432F-B61D-10C166CA2798}",
					},
					{
						CLSID: "{FAB_250_DUAL_R}",
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
					},
					{
						CLSID: "{RKL609_R}",
					},
				],
			},
			{
				task: "default",
				name: "Default",
				displayName: "Default",
				pylons: [
					{
						CLSID: "{RKL609_L}",
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
					},
					{
						CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}",
					},
					{
						CLSID: "{B4C01D60-A8A3-4237-BD72-CA7655BC0FE9}",
					},
					{
						CLSID: "{B4C01D60-A8A3-4237-BD72-CA7655BC0FE9}",
					},
					{
						CLSID: "{B4C01D60-A8A3-4237-BD72-CA7655BC0FE9}",
					},
					{
						CLSID: "{B4C01D60-A8A3-4237-BD72-CA7655BC0FE9}",
					},
					{
						CLSID: "{E8069896-8435-4B90-95C0-01A03AE6E400}",
					},
					{
						CLSID: "{FBC29BFE-3D24-4C64-B81D-941239D12249}",
					},
					{
						CLSID: "{RKL609_R}",
					},
				],
			},
		],
	},
	"JF-17": {
		chaff: 36,
		display_name: "JF-17",
		flare: 32,
		max_fuel: 2325,
		max_height: 16920,
		max_speed: 2520,
		name: "JF-17",
		availableTasks: [
			"Antiship Strike",
			"CAP",
			"CAS",
			"DEAD",
			"Escort",
			"Fighter Sweep",
			"Ground Attack",
			"Intercept",
			"Pinpoint Strike",
		],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Modern",
		isHelicopter: false,
		loadouts: [
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "DIS_PL-5EII",
						num: 1,
					},
					{
						CLSID: "DIS_WMD7",
						num: 2,
					},
					{
						CLSID: "DIS_GB6_TSP",
						num: 3,
					},
					{
						CLSID: "DIS_TANK800",
						num: 4,
					},
					{
						CLSID: "DIS_GB6_TSP",
						num: 5,
					},
					{
						CLSID: "DIS_BRM1_90",
						num: 6,
					},
					{
						CLSID: "DIS_PL-5EII",
						num: 7,
					},
				],
			},
			{
				task: "Ground Attack",
				name: "Ground Attack",
				displayName: "Ground Attack",
				pylons: [
					{
						CLSID: "DIS_PL-5EII",
						num: 1,
					},
					{
						CLSID: "DIS_GBU_12_DUAL_GDJ_II19_L",
						num: 2,
					},
					{
						CLSID: "DIS_TANK1100",
						num: 3,
					},
					{
						CLSID: "DIS_WMD7",
						num: 4,
					},
					{
						CLSID: "DIS_TANK1100",
						num: 5,
					},
					{
						CLSID: "DIS_GBU_12_DUAL_GDJ_II19_R",
						num: 6,
					},
					{
						CLSID: "DIS_PL-5EII",
						num: 7,
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "DIS_PL-5EII",
						num: 1,
					},
					{
						CLSID: "DIS_LS_6_500",
						num: 2,
					},
					{
						CLSID: "DIS_TANK1100",
						num: 3,
					},
					{
						CLSID: "DIS_WMD7",
						num: 4,
					},
					{
						CLSID: "DIS_TANK1100",
						num: 5,
					},
					{
						CLSID: "DIS_LS_6_500",
						num: 6,
					},
					{
						CLSID: "DIS_PL-5EII",
						num: 7,
					},
				],
			},
			{
				task: "DEAD",
				name: "DEAD",
				displayName: "DEAD",
				pylons: [
					{
						CLSID: "DIS_PL-5EII",
						num: 1,
					},
					{
						CLSID: "DIS_LD-10_DUAL_L",
						num: 2,
					},
					{
						CLSID: "DIS_TANK1100",
						num: 3,
					},
					{
						CLSID: "DIS_SPJ_POD",
						num: 4,
					},
					{
						CLSID: "DIS_TANK1100",
						num: 5,
					},
					{
						CLSID: "DIS_LD-10_DUAL_R",
						num: 6,
					},
					{
						CLSID: "DIS_PL-5EII",
						num: 7,
					},
				],
			},
			{
				task: "SEAD",
				name: "SEAD",
				displayName: "SEAD",
				pylons: [
					{
						CLSID: "DIS_PL-5EII",
						num: 1,
					},
					{
						CLSID: "DIS_LD-10_DUAL_L",
						num: 2,
					},
					{
						CLSID: "DIS_TANK1100",
						num: 3,
					},
					{
						CLSID: "DIS_SPJ_POD",
						num: 4,
					},
					{
						CLSID: "DIS_TANK1100",
						num: 5,
					},
					{
						CLSID: "DIS_LD-10_DUAL_R",
						num: 6,
					},
					{
						CLSID: "DIS_PL-5EII",
						num: 7,
					},
				],
			},
			{
				task: "default",
				name: "SD-10*4, PL-5*2, FUEL*2",
				displayName: "SD-10*4, PL-5*2, FUEL*2",
				pylons: [
					{
						CLSID: "DIS_PL-5EII",
						num: 1,
					},
					{
						CLSID: "DIS_SD-10_DUAL_L",
						num: 2,
					},
					{
						CLSID: "DIS_TANK1100",
						num: 3,
					},
					{ CLSID: "<CLEAN>", num: 4 },
					{
						CLSID: "DIS_TANK1100",
						num: 5,
					},
					{
						CLSID: "DIS_SD-10_DUAL_R",
						num: 6,
					},
					{
						CLSID: "DIS_PL-5EII",
						num: 7,
					},
				],
			},
		],
	},
	AJS37: {
		chaff: 210,
		display_name: "Viggen",
		flare: 72,
		max_fuel: 4476,
		max_height: 21000,
		max_speed: 2203.2,
		name: "AJS37",
		availableTasks: [
			"Antiship Strike",
			"CAP",
			"CAS",
			"DEAD",
			"Escort",
			"Fighter Sweep",
			"Ground Attack",
			"Intercept",
			"Pinpoint Strike",
		],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 1000,
		cruiseSpeed: 220.97222222222,
		era: "Early CW",
		isHelicopter: false,
		loadouts: [
			{
				task: "CAS",
				name: "CAS",
				displayName: "CAS",
				pylons: [
					{
						CLSID: "{Robot24J}",
					},
					{
						CLSID: "{RB75B}",
					},
					{
						CLSID: "{RB75B}",
					},
					{
						CLSID: "{VIGGEN_X-TANK}",
					},
					{
						CLSID: "{RB75B}",
					},
					{
						CLSID: "{RB75B}",
					},
					{
						CLSID: "{Robot24J}",
					},
				],
			},
			{
				task: "Ground Attack",
				name: "Ground Attack",
				displayName: "Ground Attack",
				pylons: [
					{
						CLSID: "{Robot24J}",
					},
					{
						CLSID: "{ARAKM70BAP}",
					},
					{
						CLSID: "{ARAKM70BAP}",
					},
					{
						CLSID: "{VIGGEN_X-TANK}",
					},
					{
						CLSID: "{ARAKM70BAP}",
					},
					{
						CLSID: "{ARAKM70BAP}",
					},
					{
						CLSID: "{Robot24J}",
					},
				],
			},
			{
				task: "Pinpoint Strike",
				name: "Strike",
				displayName: "Strike",
				pylons: [
					{
						CLSID: "{Robot24J}",
					},
					{
						CLSID: "{M71BOMB}",
					},
					{
						CLSID: "{M71BOMB}",
					},
					{
						CLSID: "{VIGGEN_X-TANK}",
					},
					{
						CLSID: "{M71BOMB}",
					},
					{
						CLSID: "{M71BOMB}",
					},
					{
						CLSID: "{Robot24J}",
					},
				],
			},
			{
				task: "DEAD",
				name: "DEAD",
				displayName: "DEAD",
				pylons: [
					{
						CLSID: "{Robot24J}",
					},
					{
						CLSID: "{BK90}",
					},
					{
						CLSID: "{BK90}",
					},
					{
						CLSID: "{VIGGEN_X-TANK}",
					},
					{
						CLSID: "{BK90}",
					},
					{
						CLSID: "{BK90}",
					},
					{
						CLSID: "{Robot24J}",
					},
				],
			},
			{
				task: "SEAD",
				name: "SEAD",
				displayName: "SEAD",
				pylons: [
					{
						CLSID: "{Robot24J}",
					},
					{
						CLSID: "{BK90}",
					},
					{
						CLSID: "{BK90}",
					},
					{
						CLSID: "{VIGGEN_X-TANK}",
					},
					{
						CLSID: "{BK90}",
					},
					{
						CLSID: "{BK90}",
					},
					{
						CLSID: "{Robot24J}",
					},
				],
			},
			{
				task: "default",
				name: "Default",
				displayName: "Default",
				pylons: [
					{
						CLSID: "{Robot24J}",
					},
					{
						CLSID: "{Robot74}",
					},
					{
						CLSID: "{Robot74}",
					},
					{
						CLSID: "{VIGGEN_X-TANK}",
					},
					{
						CLSID: "{Robot74}",
					},
					{
						CLSID: "{Robot74}",
					},
					{
						CLSID: "{Robot24J}",
					},
				],
			},
		],
	},
	MosquitoFBMkVI: {
		chaff: 0,
		display_name: "Mosquito",
		flare: 0,
		max_fuel: 1483.1,
		max_height: 11500,
		max_speed: 648,
		name: "MosquitoFBMkVI",
		availableTasks: ["CAS", "Ground Attack", "Pinpoint Strike"],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 113,
		era: "WW2",
		isHelicopter: false,
		loadouts: [
			{
				displayName: "Default",
				name: "default",
				task: "default",
				pylons: [
					{
						CLSID: "{MOSQUITO_100GAL_SLIPPER_TANK}",
						num: 1,
					},
					{
						CLSID: "{MOSQUITO_100GAL_SLIPPER_TANK}",
						num: 2,
					},
					{
						CLSID: "{British_MC_500LB_Bomb_Mk1_Short_on_Handley_Page_Type_B_Cut_Bar}",
						num: 3,
					},
					{
						CLSID: "{British_MC_500LB_Bomb_Mk1_Short_on_Handley_Page_Type_B_Cut_Bar}",
						num: 4,
					},
				],
			},
		],
	},
	"Ju-88A4": {
		chaff: 0,
		display_name: "Ju 88",
		flare: 0,
		max_fuel: 2120,
		max_height: 11500,
		max_speed: 540,
		name: "Ju-88A4",
		availableTasks: ["CAS", "Ground Attack", "Pinpoint Strike"],
		carrierCapable: false,
		controllable: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 113,
		era: "WW2",
		isHelicopter: false,
		loadouts: [
			{
				displayName: "Default",
				name: "default",
				task: "default",
				pylons: [
					{
						CLSID: "{SC_500_L2}",
						num: 1,
					},
					{
						CLSID: "{JU88A4TORP_10xSC50_on_InvCountedAttachmentPoints}",
						num: 2,
					},
					{
						CLSID: "{SC_500_L2}",
						num: 3,
					},
				],
			},
		],
	},
	"SK-60": {
		chaff: 120,
		display_name: "SK-60",
		flare: 120,
		max_fuel: 3181,
		max_height: 11500,
		max_speed: 763,
		name: "SK-60",
		availableTasks: ["CAS", "Ground Attack", "Pinpoint Strike"],
		carrierCapable: false,
		controllable: true,
		cruiseAltitude: 6096,
		cruiseSpeed: 200,
		era: "Early CW",
		isHelicopter: false,
		isMod: true,
		allowedFrequency: [100, 156],
		loadouts: [
			{
				displayName: "Default",
				name: "default",
				task: "default",
				pylons: [
					{
						CLSID: "{d694b359-e7a8-4909-88d4-7100b77afd12}",
						num: 1,
					},
					{
						CLSID: "{d694b359-e7a8-4909-88d4-7100b77afd12}",
						num: 2,
					},
					{
						CLSID: "{d694b359-e7a8-4909-88d4-7100b77afd11}",
						num: 3,
					},
					{
						CLSID: "{d694b359-e7a8-4909-88d4-7100b77afd11}",
						num: 4,
					},
					{
						CLSID: "{d694b359-e7a8-4909-88d4-7100b77afd12}",
						num: 5,
					},
					{
						CLSID: "{d694b359-e7a8-4909-88d4-7100b77afd12}",
						num: 6,
					},
				],
			},
		],
	},
	"KJ-2000": {
		chaff: 0,
		display_name: "KJ-2000",
		flare: 0,
		max_fuel: 70000,
		max_height: 12247,
		max_speed: 849.996,
		name: "KJ-2000",
		availableTasks: ["AWACS"],
		carrierCapable: false,
		controllable: false,
		isHelicopter: false,
		cruiseAltitude: 6096,
		cruiseSpeed: 220.97222222222,
		era: "Korea",
		isLarge: true,
		loadouts: [
			{
				task: "default",
				name: "default",
				displayName: "default",
				pylons: [],
			},
		],
	},
};
