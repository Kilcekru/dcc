/* eslint-disable solid/reactivity */
import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createMemo, createSignal, For, Setter } from "solid-js";

import { AircraftLabel } from "../../../components/aircraft-label/AircraftLabel";
import { useCreateCampaignStore } from "../CreateCampaignContext";
import Styles from "./CustomFaction.module.less";
import { useFactions } from "./utils";

const AircraftList = (props: {
	missionTask: DcsJs.Task;
	selectedAircrafts: Array<string>;
	toggle: (name: string) => void;
}) => {
	const aircrafts = createMemo(() => {
		return Object.values(DcsJs.aircraftDefinitions)
			.filter((ac) => ac.availableTasks.some((t) => t === props.missionTask))
			.sort((a, b) => Utils.Sort.String.asc(a.display_name, b.display_name));
	});

	return (
		<div class={Styles["aircraft-list"]}>
			<For each={aircrafts()}>
				{(aircraft) => (
					<Components.Button
						class={Styles.aircraft}
						unstyled={!props.selectedAircrafts.some((ac) => ac === aircraft.name)}
						onPress={() => props.toggle(aircraft.name)}
					>
						<AircraftLabel aircraftType={aircraft.name} />
					</Components.Button>
				)}
			</For>
		</div>
	);
};

const TemplateList = (props: { selectedTemplateName: string; toggle: (name: string) => void }) => {
	return (
		<div class={Styles["aircraft-list"]}>
			<For each={DcsJs.groundUnitsTemplates}>
				{(template) => (
					<Components.Button
						class={Styles.aircraft}
						unstyled={props.selectedTemplateName !== template.name}
						onPress={() => props.toggle(template.name)}
					>
						{template.name}
					</Components.Button>
				)}
			</For>
		</div>
	);
};

const CarrierList = (props: {
	selectedCarrierName: string | undefined;
	toggle: (name: string | undefined) => void;
}) => {
	const onPress = (name: string) => {
		if (props.selectedCarrierName === name) {
			props.toggle(undefined);
		} else {
			props.toggle(name);
		}
	};
	return (
		<div class={Styles["aircraft-list"]}>
			<For each={Object.values(DcsJs.shipGroups)}>
				{(sg) => (
					<Components.Button
						class={Styles.aircraft}
						unstyled={props.selectedCarrierName !== sg.name}
						onPress={() => onPress(sg.name)}
					>
						{sg.name}
					</Components.Button>
				)}
			</For>
		</div>
	);
};

const countries = ["USA", "Russia", "France", "Germany", "Austria", "Iraq", "Iran", "Israel", "Syria", "Sweden"];

const CountryList = (props: { selectedCountry: string; toggle: (name: string) => void }) => {
	return (
		<div class={Styles["aircraft-list"]}>
			<For each={countries}>
				{(country) => (
					<Components.Button
						class={Styles.aircraft}
						unstyled={props.selectedCountry !== country}
						onPress={() => props.toggle(country)}
					>
						{country}
					</Components.Button>
				)}
			</For>
		</div>
	);
};

export const CustomFaction = () => {
	const store = useCreateCampaignStore();
	const [name, setName] = createSignal(store.faction?.name ?? "Custom");
	const [year, setYear] = createSignal(store.faction?.year ?? 2023);
	const [cap, setCap] = createSignal<Array<string>>(store.faction?.aircraftTypes.CAP ?? []);
	const [cas, setCas] = createSignal<Array<string>>(store.faction?.aircraftTypes.CAS ?? []);
	const [awacs, setAwacs] = createSignal<Array<string>>(store.faction?.aircraftTypes.AWACS ?? []);
	const [sead, setSead] = createSignal<Array<string>>(store.faction?.aircraftTypes.SEAD ?? []);
	const [strike, setStrike] = createSignal<Array<string>>(store.faction?.aircraftTypes["Pinpoint Strike"] ?? []);
	const [csar, setCsar] = createSignal<Array<string>>(store.faction?.aircraftTypes.CSAR ?? []);
	const [airAssault, setAirAssault] = createSignal<Array<string>>(store.faction?.aircraftTypes["Air Assault"] ?? []);
	const [templateName, setTemplateName] = createSignal(store.faction?.templateName ?? "USA - Modern");
	const [carrierName, setCarrierName] = createSignal<string | undefined>(store.faction?.carrierName);
	const [country, setCountry] = createSignal(store.faction?.countryName ?? "USA");
	const { onSave } = useFactions();

	const toggleAircraft = (task: DcsJs.Task, name: string) => {
		let list: Array<string> = [];
		let setter: Setter<Array<string>>;

		switch (task) {
			case "CAP": {
				list = cap();
				setter = setCap;
				break;
			}
			case "CAS": {
				list = cas();
				setter = setCas;
				break;
			}
			case "AWACS": {
				list = awacs();
				setter = setAwacs;
				break;
			}
			case "DEAD": {
				list = sead();
				setter = setSead;
				break;
			}
			case "Pinpoint Strike": {
				list = strike();
				setter = setStrike;
				break;
			}
			case "CSAR": {
				list = csar();
				setter = setCsar;
				break;
			}
			case "Air Assault": {
				list = airAssault();
				setter = setAirAssault;
				break;
			}
			default: {
				list = cap();
				setter = setCap;
			}
		}

		if (list.some((ac) => ac === name)) {
			setter((s) => s.filter((ac) => ac !== name));
		} else {
			setter((s) => [...s, name]);
		}
	};

	const onNext = () => {
		const f: Types.Campaign.Faction = {
			aircraftTypes: {
				CAP: cap() as DcsJs.AircraftType[],
				CAS: cas() as DcsJs.AircraftType[],
				AWACS: awacs() as DcsJs.AircraftType[],
				SEAD: sead() as DcsJs.AircraftType[],
				"Pinpoint Strike": strike() as DcsJs.AircraftType[],
				CSAR: csar() as DcsJs.AircraftType[],
				"Air Assault": airAssault() as DcsJs.AircraftType[],
			},
			countryName: country(),
			name: name() == "" ? "Custom" : name(),
			playable: true,
			year: year(),
			templateName: templateName(),
			carrierName: carrierName(),
			created: store.faction?.created,
		};

		// eslint-disable-next-line no-console
		onSave(f).catch((e) => console.error(Utils.errMsg(e)));

		store.faction = f;
	};

	const onPrev = () => {
		if (store.prevScreen == null) {
			throw new Error("No previous screen");
		}

		store.currentScreen = store.prevScreen;
		store.prevScreen = undefined;
	};

	const validFaction = createMemo(
		() => cap().length > 0 && cas().length > 0 && awacs().length > 0 && sead().length > 0 && strike().length > 0,
	);

	return (
		<div class={Styles.wrapper}>
			<Components.Button large unstyled class={Styles["back-button"]} onPress={onPrev}>
				<Components.Icons.ArrowBack />
			</Components.Button>
			<h1 class={Styles.title}>Create Custom Faction</h1>
			<Components.ScrollContainer>
				<div class={Styles["scroll-container"]}>
					<div class={Styles.inputs}>
						<div>
							<h2 class={Styles["input-label"]}>Name</h2>
							<Components.TextField value={name()} onChange={setName} />
						</div>
						<div>
							<h2 class={Styles["input-label"]}>Year</h2>
							<Components.NumberField value={year()} onChange={setYear} />
						</div>
					</div>
					<h2 class={Styles["mission-task"]}>Countries</h2>
					<CountryList selectedCountry={country()} toggle={setCountry} />
					<h2 class={Styles["mission-task"]}>CAP</h2>
					<AircraftList missionTask="CAP" selectedAircrafts={cap()} toggle={(name) => toggleAircraft("CAP", name)} />
					<h2 class={Styles["mission-task"]}>CAS</h2>
					<AircraftList missionTask="CAS" selectedAircrafts={cas()} toggle={(name) => toggleAircraft("CAS", name)} />
					<h2 class={Styles["mission-task"]}>AWACS</h2>
					<AircraftList
						missionTask="AWACS"
						selectedAircrafts={awacs()}
						toggle={(name) => toggleAircraft("AWACS", name)}
					/>
					<h2 class={Styles["mission-task"]}>SEAD</h2>
					<AircraftList missionTask="SEAD" selectedAircrafts={sead()} toggle={(name) => toggleAircraft("SEAD", name)} />
					<h2 class={Styles["mission-task"]}>Strike</h2>
					<AircraftList
						missionTask="Pinpoint Strike"
						selectedAircrafts={strike()}
						toggle={(name) => toggleAircraft("Pinpoint Strike", name)}
					/>
					<h2 class={Styles["mission-task"]}>CSAR</h2>
					<AircraftList missionTask="CSAR" selectedAircrafts={csar()} toggle={(name) => toggleAircraft("CSAR", name)} />
					<h2 class={Styles["mission-task"]}>Air Assault</h2>
					<AircraftList
						missionTask="Air Assault"
						selectedAircrafts={airAssault()}
						toggle={(name) => toggleAircraft("Air Assault", name)}
					/>
					<h2 class={Styles["mission-task"]}>Ground Units</h2>
					<TemplateList selectedTemplateName={templateName()} toggle={setTemplateName} />
					<h2 class={Styles["mission-task"]}>Carrier</h2>
					<CarrierList selectedCarrierName={carrierName()} toggle={setCarrierName} />
				</div>
			</Components.ScrollContainer>
			<div class={Styles.buttons}>
				<Components.Button large onPress={onNext} disabled={!validFaction()}>
					Next
				</Components.Button>
			</div>
		</div>
	);
};
