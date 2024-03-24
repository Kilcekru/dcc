import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import { createMemo, For, Show, useContext } from "solid-js";

import { formatPercentage } from "../../../../../../../libs/components/src/utils";
import { CampaignContext, useGetEntity } from "../../../../components";
import { Flag } from "./Flag";
import Styles from "./Item.module.less";
import { StructureBuilding } from "./StructureBuilding";

function UnitCampStats(props: { unitCamp: Types.Serialization.UnitCampSerialized }) {
	return (
		<>
			<Components.Stat>
				<Components.StatLabel>Power</Components.StatLabel>
				<Components.StatValue>{props.unitCamp.hasPower ? "Active" : "Inactive"}</Components.StatValue>
			</Components.Stat>
			<Components.Stat>
				<Components.StatLabel>Ammo</Components.StatLabel>
				<Components.StatValue>{props.unitCamp.hasAmmo ? "Active" : "Inactive"}</Components.StatValue>
			</Components.Stat>
			<Show when={props.unitCamp.structureType === "Depot"}>
				<Components.Stat>
					<Components.StatLabel>Fuel</Components.StatLabel>
					<Components.StatValue>{props.unitCamp.hasFuel ? "Active" : "Inactive"}</Components.StatValue>
				</Components.Stat>
			</Show>
			<Components.Stat>
				<Components.StatLabel>Deployment Score</Components.StatLabel>
				<Components.StatValue>
					{formatPercentage(Math.max(0, (props.unitCamp.deploymentScore / props.unitCamp.deploymentCost) * 100))}
				</Components.StatValue>
			</Components.Stat>
		</>
	);
}

export function Structure(props: { structure: Types.Serialization.StructureSerialized }) {
	const [state] = useContext(CampaignContext);
	const getEntity = useGetEntity();

	const objective = createMemo(() => {
		const id = props.structure.objectiveId;
		if (id == null) {
			return undefined;
		}

		return getEntity<Types.Serialization.ObjectiveSerialized>(id);
	});

	const countryName = createMemo(() => {
		const coalition = props.structure.coalition;
		const faction = state.factionDefinitions[coalition];

		if (faction == null) {
			return undefined;
		}
		return faction.countryName;
	});

	return (
		<>
			<div>
				<Flag countryName={countryName()} />
				<h2 class={Styles.title}>{objective()?.name}</h2>
				<h3 class={Styles.subtitle}>{props.structure?.structureType}</h3>
			</div>
			<div class={Styles.stats}>
				<Components.Stat>
					<Components.StatLabel>Status</Components.StatLabel>
					<Components.StatValue>{props.structure?.active ? "Active" : "Inactive"}</Components.StatValue>
				</Components.Stat>
				<Show when={props.structure?.entityType === "UnitCamp"}>
					<UnitCampStats unitCamp={props.structure as Types.Serialization.UnitCampSerialized} />
				</Show>
			</div>

			<Components.ScrollContainer>
				<Components.List>
					<For each={props.structure?.buildingIds}>
						{(buildingId) => {
							const building = getEntity<Types.Serialization.BuildingSerialized>(buildingId);
							return <StructureBuilding building={building} />;
						}}
					</For>
				</Components.List>
			</Components.ScrollContainer>
		</>
		/* <Show when={props.structure?.type === "Farp"}>
				<Components.ScrollContainer>
					<Components.List>
						<For each={aircrafts()}>
							{(unit) => (
								<Components.ListItem>
									<Aircraft unit={unit} />
								</Components.ListItem>
							)}
						</For>
					</Components.List>
				</Components.ScrollContainer>
							</Show> */
	);
}
