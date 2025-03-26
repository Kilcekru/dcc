import * as Types from "@kilcekru/dcc-shared-types";

const sidcUnitCode = {
	airport: "IBA---",
	airDefence: "UCD---",
	airDefenceMissle: "UCDM--",
	armor: "UCA---",
	infantry: "UCI---",
	armamentProduction: "IMG---",
	fuelStorage: "IRP---",
	powerPlant: "IUE---",
	depot: "IMV---",
	ammoDepot: "IME---",
	attack: "MFA---",
	aew: "MFRW--",
	fighter: "MFF---",
	waypoint: "MGPI--",
	militaryBase: "IB----",
	installation: "I-----",
	transport: "IT----",
	radar: "ESR---",
	carrier: "CLCV--",
	downedPilot: "USS6--",
	hospital: "IXH---",
	attackHelicopter: "MHA---",
	csar: "MHH---",
};

type SidcUnitCodeKey = keyof typeof sidcUnitCode;

function getUnitCode(item: Types.Campaign.MapItem): SidcUnitCodeKey {
	switch (item.type) {
		case "structure": {
			switch (item.structureType) {
				case "Fuel Storage":
					return "fuelStorage";
				case "Power Plant":
					return "powerPlant";
				case "Depot":
					return "depot";
				case "Ammo Depot":
					return "ammoDepot";
				case "Hospital":
					return "hospital";
				case "Farp":
					return "militaryBase";
				case "Barrack":
					return "transport";
				default:
					return "installation";
			}
		}
		case "airdrome":
			return "airport";
		case "flightGroup": {
			switch (item.task) {
				case "CAS":
				case "Pinpoint Strike":
					return "attack";
				case "CSAR":
					return "csar";
				default:
					return "fighter";
			}
		}
		case "groundGroup": {
			switch (item.groundGroupType) {
				case "infantry":
					return "infantry";
				default:
					return "armor";
			}
		}
		case "downedPilot":
			return "downedPilot";
		case "sam":
			return "airDefenceMissle";
		default:
			return "waypoint";
	}
}

function getDomain(item: Types.Campaign.MapItem): "air" | "ground" | "sea" {
	switch (item.type) {
		case "structure":
		case "airdrome":
		case "groundGroup":
		case "sam":
		case "downedPilot":
			return "ground";
		case "flightGroup":
			return "air";
		default:
			return "sea";
	}
}

export function getMilSymbolCode(item: Types.Campaign.MapItem): string {
	const hostileCode = item.coalition === "red" ? "H" : "F";
	const domain = getDomain(item);
	const unitCode = getUnitCode(item);
	const domainCode = domain === "air" ? "A" : domain === "sea" ? "S" : "G";
	return `S${hostileCode}${domainCode}-${sidcUnitCode[unitCode]}`;
}
