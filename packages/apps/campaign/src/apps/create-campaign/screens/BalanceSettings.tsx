import * as Components from "@kilcekru/dcc-lib-components";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { unwrap } from "solid-js/store";

import { scenarioList } from "../../../data";
import { sendWorkerMessage } from "../../../worker";
import { useCreateCampaignStore, useSetCreateCampaignStore } from "../CreateCampaignContext";
import Styles from "./BalanceSettings.module.less";

export function BalanceSettings() {
	const store = useCreateCampaignStore();
	const setStore = useSetCreateCampaignStore();
	const createToast = Components.useCreateErrorToast();

	async function generate() {
		const scenarioDefinition = scenarioList.find((s) => s.name === store.scenarioName);

		if (scenarioDefinition == null) {
			throw new Error("Scenario not found");
		}

		const cloned = structuredClone(unwrap(store));

		if (cloned.faction == null || cloned.enemyFaction == null) {
			throw new Error("Factions not selected");
		}

		sendWorkerMessage({
			name: "generate",
			payload: {
				blueFactionDefinition: cloned.faction,
				redFactionDefinition: cloned.enemyFaction,
				scenario: scenarioDefinition,
				campaignParams: {
					...cloned,
					hotStart: false,
				},
			},
		});

		sendWorkerMessage({
			name: "resume",
			payload: { multiplier: 1 },
		});
	}

	function onNext() {
		generate().catch((e) => {
			// eslint-disable-next-line no-console
			console.error(e);
			createToast({
				title: "Campaign not created",
				description: e instanceof Error ? e.message : "Unknown Error",
			});
		});
	}

	function onPrev() {
		setStore("currentScreen", "Settings");
	}

	return (
		<div>
			<Components.Button large unstyled class={Styles["back-button"]} onPress={onPrev}>
				<Components.Icons.ArrowBack />
			</Components.Button>
			<h2 class={Styles.title}>AI Skill Level</h2>
			<Components.Range
				class={Styles.range}
				value={Utils.Params.AiSkillToIndex(store.aiSkill)}
				onChange={(next) => setStore("aiSkill", Utils.Params.IndexToAiSkill(next))}
				steps={4}
			>
				<Components.RangeLabel>{Utils.Params.AiSkillLabel["Average"]}</Components.RangeLabel>
				<Components.RangeLabel>{Utils.Params.AiSkillLabel["Excellent"]}</Components.RangeLabel>
			</Components.Range>
			<h2 class={Styles.title}>How many Air to Air aircrafts should the enemy have?</h2>
			<Components.Range
				class={Styles.range}
				value={store.a2aLevel}
				onChange={(next) => setStore("a2aLevel", next)}
				steps={3}
			>
				<Components.RangeLabel>None</Components.RangeLabel>
				<Components.RangeLabel>Some</Components.RangeLabel>
				<Components.RangeLabel>Normal</Components.RangeLabel>
			</Components.Range>
			<h2 class={Styles.title}>How many Short Range Air Defenses should the enemy have?</h2>
			<Components.Range
				class={Styles.range}
				value={store.shoradLevel}
				onChange={(next) => setStore("shoradLevel", next)}
				steps={3}
			>
				<Components.RangeLabel>None</Components.RangeLabel>
				<Components.RangeLabel>Some</Components.RangeLabel>
				<Components.RangeLabel>Normal</Components.RangeLabel>
			</Components.Range>

			<h2 class={Styles.title}>Should the enemy Surface-to-air missiles be active?</h2>
			<Components.Range
				class={Styles.range}
				value={store.samActive}
				onChange={(next) => setStore("samActive", next)}
				steps={3}
			>
				<Components.RangeLabel>None</Components.RangeLabel>
				<Components.RangeLabel>Active, without repair</Components.RangeLabel>
				<Components.RangeLabel>Active, with repair</Components.RangeLabel>
			</Components.Range>
			<div class={Styles.buttons}>
				<Components.Button large onPress={onNext}>
					Next
				</Components.Button>
			</div>
		</div>
	);
}
