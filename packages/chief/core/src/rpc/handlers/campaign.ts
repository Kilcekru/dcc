import * as DcsJs from "@foxdelta2/dcsjs";
import * as DcsJSSave from "@foxdelta2/dcsjs/dist/save";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import FS from "fs-extra";

import * as Domain from "../../domain";

const saveCampaign: Types.Rpc.Campaign["saveCampaign"] = async (campaign) => {
	return Domain.Persistance.CampaignPersistance.put({
		...campaign,
		edited: new Date(),
		time: campaign.time ?? 0,
		countryName: campaign.factionDefinitions.blue?.countryName ?? "",
		factionName: campaign.factionDefinitions.blue?.name ?? "",
	});
};

const resumeCampaign: Types.Rpc.Campaign["resumeCampaign"] = async (version) => {
	const list = await Domain.Persistance.CampaignPersistance.list();

	const activeSynopsis = Object.values(list).find((syn) => syn.active && (syn.version ?? 0) >= version);

	if (activeSynopsis == null) {
		return Object.values(list).length > 0 ? undefined : null;
	}
	return await Domain.Persistance.CampaignPersistance.get(activeSynopsis.id);
};

const openCampaign: Types.Rpc.Campaign["openCampaign"] = async (id) => {
	return Domain.Persistance.CampaignPersistance.get(id);
};

const removeCampaign: Types.Rpc.Campaign["removeCampaign"] = async (id) => {
	return Domain.Persistance.CampaignPersistance.remove(id);
};

const loadCampaignList: Types.Rpc.Campaign["loadCampaignList"] = async () => {
	return Domain.Persistance.CampaignPersistance.list();
};

const getCountryForCoalition = (
	coalition: DcsJs.Coalition,
	campaign: Types.Serialization.UIStateEntitiesArray,
): DcsJs.CountryName => {
	switch (coalition) {
		case "blue":
			return campaign.factionDefinitions.blue?.countryName ?? "USA";
		case "red":
			return campaign.factionDefinitions.red?.countryName ?? "Russia";
		default:
			return "USA";
	}
};

const generateCampaignMission: Types.Rpc.Campaign["generateCampaignMission"] = async (campaign) => {
	const path = Domain.Campaign.getMissionPath();
	const entityMap = new Map(campaign.entities.map((entity) => [entity.id, entity]));
	const getEntity = Utils.ECS.EntitySelector(entityMap);

	if (path == undefined) {
		return { success: false };
	}

	// const kneeboards = await Domain.Campaign.generateBriefingKneeboards(campaign); TODO

	const mission = new DcsJs.Mission({
		id: campaign.missionId,
		date: new Date(campaign.date),
		time: campaign.time,
		theatre: campaign.theatre,
		weather: {
			cloudCover: 0,
			cloudCoverData: [],
			offset: 0,
			temperature: 20,
			wind: {
				direction: 0,
				speed: 0,
			},
		},
		aiSkill: campaign.campaignParams.aiSkill,
		airdromes: {
			blue: new Set(campaign.airdromes.blue),
			red: new Set(campaign.airdromes.red),
			neutrals: new Set(campaign.airdromes.neutrals),
		},
		countries: {
			blue: campaign.factionDefinitions.blue?.countryName ?? "USA",
			red: campaign.factionDefinitions.red?.countryName ?? "Russia",
			neutrals: "Switzerland",
		},
		hotStart: campaign.campaignParams.hotStart,
	});

	for (const entity of campaign.entities.values()) {
		if (entity.entityType === "GroundGroup") {
			if (entity.queries.includes("groundGroups-embarked")) {
				continue;
			}

			const units = [];
			let target: Types.Serialization.ObjectiveSerialized | undefined = undefined;

			for (const id of entity.unitIds) {
				const groundUnit = getEntity<Types.Serialization.GroundUnitSerialized>(id);

				if (groundUnit == null) {
					continue;
				}

				if (groundUnit.alive === false) {
					continue;
				}

				units.push({
					type: groundUnit.type,
					name: groundUnit.name,
				});
			}

			if (units.length === 0) {
				continue;
			}

			if (entity.queries.includes("groundGroups-on target")) {
				target = getEntity<Types.Serialization.ObjectiveSerialized>(entity.targetId);
			}

			mission.createGroundGroup({
				countryName: getCountryForCoalition(entity.coalition, campaign),
				name: entity.name,
				position: entity.position,
				units,
				objectiveName: target?.name ?? undefined,
			});
		}

		if (entity.entityType === "SAM") {
			const units = [];
			let target: Types.Serialization.ObjectiveSerialized | undefined = undefined;

			for (const id of entity.unitIds) {
				const groundUnit = getEntity<Types.Serialization.GroundUnitSerialized>(id);

				if (groundUnit == null) {
					continue;
				}

				if (groundUnit.alive === false) {
					continue;
				}

				units.push({
					type: groundUnit.type,
					name: groundUnit.name,
				});
			}

			if (units.length === 0) {
				continue;
			}

			target = getEntity<Types.Serialization.ObjectiveSerialized>(entity.objectiveId);

			mission.createSamGroup({
				countryName: getCountryForCoalition(entity.coalition, campaign),
				name: entity.name,
				units,
				objectiveName: target?.name ?? undefined,
				position: entity.position,
			});
		}

		// Structures
		if (entity.entityType === "GenericStructure" || entity.entityType === "UnitCamp") {
			const units = [];

			for (const id of entity.buildingIds) {
				const building = getEntity<Types.Serialization.BuildingSerialized>(id);

				if (building == null) {
					continue;
				}

				if (building.alive === false) {
					continue;
				}

				units.push({
					type: building.buildingType,
					name: building.name,
					position: {
						x: entity.position.x + building.offset.x,
						y: entity.position.y + building.offset.y,
					},
				});
			}

			if (units.length === 0) {
				continue;
			}

			mission.createStaticGroup({
				countryName: getCountryForCoalition(entity.coalition, campaign),
				name: entity.name,
				position: entity.position,
				units,
			});
		}

		// Flight Group
		if (entity.entityType.includes("FlightGroup")) {
			const fg = entity as Types.Serialization.FlightGroupSerialized;
			const pkg = getEntity<Types.Serialization.PackageSerialized>(fg.packageId);
			const flightplan = getEntity<Types.Serialization.FlightplanSerialized>(fg.flightplanId);
			const homeBase = getEntity<Types.Serialization.HomeBaseSerialized>(fg.homeBaseId);

			const units: DcsJs.InputTypes.FlightGroupUnit[] = [];
			const waypoints: DcsJs.InputTypes.Waypoint[] = [];

			for (const id of fg.aircraftIds) {
				const unit = getEntity<Types.Serialization.AircraftSerialized>(id);

				if (unit == null) {
					continue;
				}

				if (unit.alive === false) {
					continue;
				}

				if (unit.name == null || unit.callSign == null || unit.loadout == null) {
					throw new Error("Unit name, callsign or loadout is null");
				}

				units.push({
					type: unit.aircraftType,
					name: unit.name ?? unit.id,
					onboardNumber: unit.onboardNumber,
					callsign: unit.callSign,
					isClient: unit.isClient,
					pylons: unit.loadout.pylons,
				});
			}

			for (const wp of flightplan.waypoints) {
				waypoints.push({
					arrivalTime: wp.arrivalTime,
					name: wp.name,
					onGround: wp.onGround,
					position: wp.position,
					type: wp.type,
					duration: wp.duration,
				});

				if (wp.raceTrack != null) {
					waypoints.push({
						arrivalTime: wp.raceTrack.arrivalTime,
						name: wp.raceTrack.name,
						onGround: wp.onGround,
						position: wp.raceTrack.position,
						type: "RaceTrack End",
					});
				}
			}

			/* for (const wp of flightplan.waypoints) {
 
			} */

			if (units.length === 0) {
				continue;
			}

			mission.createFlightGroup({
				countryName: getCountryForCoalition(entity.coalition, campaign),
				coalition: entity.coalition,
				name: fg.name,
				position: fg.position,
				units,
				frequency: pkg.frequency,
				cruiseSpeed: pkg.cruiseSpeed,
				task: fg.task,
				waypoints,
				startTime: fg.startTime,
				homeBaseName: homeBase.name,
				homeBaseType: homeBase.type,
				hasClients: fg.hasClients,
			});
		}
	}

	await DcsJSSave.save(mission, path);

	return { success: true };
};

const loadMissionState: Types.Rpc.Campaign["loadMissionState"] = async () => {
	const path = Domain.Campaign.getMissionStatePath();

	if (path == undefined) {
		return undefined;
	}

	const jsonContent = (await FS.readJSON(path)) as unknown;

	return Types.Campaign.Schema.missionState.parse(jsonContent);
};

export async function loadFactions() {
	try {
		const result = await Domain.Persistance.readJson({
			schema: Types.Persistance.Schema.factions,
			name: Domain.Persistance.campaignFactions,
		});

		return result.factions;
	} catch (e) {
		if (!Utils.hasKey(e, "code", "string") || e.code !== "ENOENT") {
			// eslint-disable-next-line no-console
			console.warn("load factions", e instanceof Error ? e.message : "unknown error");
		}

		return [];
	}
}

export async function saveCustomFactions(factions: Array<Types.Campaign.Faction>) {
	try {
		await Domain.Persistance.writeJson({
			schema: Types.Persistance.Schema.factions,
			name: Domain.Persistance.campaignFactions,
			data: {
				version: 1,
				factions,
			},
		});
	} catch (e) {
		// eslint-disable-next-line no-console
		console.warn(e instanceof Error ? e.message : "unknown error");
	}
}

export const campaign: Types.Rpc.Campaign = {
	generateCampaignMission,
	saveCampaign,
	resumeCampaign,
	openCampaign,
	removeCampaign,
	loadCampaignList,
	loadMissionState,
	loadFactions,
	saveCustomFactions,
};
