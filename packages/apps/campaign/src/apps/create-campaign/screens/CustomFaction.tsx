import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { createMemo, createSignal, For, Setter } from "solid-js";

import { useDataStore } from "../../../components/DataProvider";
import Styles from "./CustomFaction.module.less";

const AircraftList = (props: {
	missionTask: DcsJs.Task;
	selectedAircrafts: Array<string>;
	toggle: (name: string) => void;
}) => {
	const dataStore = useDataStore();

	const aircrafts = createMemo(() => {
		const dataAircrafts = dataStore.aircrafts;

		if (dataAircrafts == null) {
			return [];
		}

		return Object.values(dataAircrafts).filter((ac) => ac.availableTasks.some((t) => t === props.missionTask));
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
						{aircraft.display_name}
					</Components.Button>
				)}
			</For>
		</div>
	);
};

export const CustomFaction = (props: { next: (faction: DcsJs.FactionDefinition) => void; prev: () => void }) => {
	/* const [faction, setFaction] = createSignal<DcsJs.FactionDefinition>({
		aircraftTypes: {
			AWACS: [],
			CAP: [],
			CAS: [],
			DEAD: [],
			"Pinpoint Strike": [],
		},
		countryName: "USA",
		name: "Custom",
		playable: true,
		template: {
			ews: [],
			infantries: [],
			sams: [],
			shoradInfantries: [],
			shoradVehicles: [],
			vehicles: [],
		},
		year: 2000,
	}); */
	const [name, setName] = createSignal("Custom");
	const [cap, setCap] = createSignal<Array<string>>([]);
	const [cas, setCas] = createSignal<Array<string>>([]);
	const [awacs, setAwacs] = createSignal<Array<string>>([]);
	const [dead, setDead] = createSignal<Array<string>>([]);
	const [strike, setStrike] = createSignal<Array<string>>([]);

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
				list = dead();
				setter = setDead;
				break;
			}
			case "Pinpoint Strike": {
				list = strike();
				setter = setStrike;
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
		props.next({
			aircraftTypes: {
				CAP: cap(),
				CAS: cas(),
				AWACS: awacs(),
				DEAD: dead(),
				"Pinpoint Strike": strike(),
			},
			countryName: "USA",
			name: name(),
			playable: true,
			year: 2000,
			template: {
				sams: ["Hawk"],
				vehicles: ["M-2 Bradley", "M-1 Abrams"],
				infantries: ["Soldier M4"],
				shoradVehicles: ["M6 Linebacker"],
				shoradInfantries: ["Soldier stinger"],
				ews: ["FPS-117"],
			},
		});
	};
	return (
		<div class={Styles.wrapper}>
			<h2>Name</h2>
			<Components.TextField value={name()} onChange={setName} />
			<h2>CAP</h2>
			<AircraftList missionTask="CAP" selectedAircrafts={cap()} toggle={(name) => toggleAircraft("CAP", name)} />
			<h2>CAS</h2>
			<AircraftList missionTask="CAS" selectedAircrafts={cas()} toggle={(name) => toggleAircraft("CAS", name)} />
			<h2>AWACS</h2>
			<AircraftList missionTask="AWACS" selectedAircrafts={awacs()} toggle={(name) => toggleAircraft("AWACS", name)} />
			<h2>DEAD</h2>
			<AircraftList missionTask="DEAD" selectedAircrafts={dead()} toggle={(name) => toggleAircraft("DEAD", name)} />
			<h2>Strike</h2>
			<AircraftList
				missionTask="Pinpoint Strike"
				selectedAircrafts={strike()}
				toggle={(name) => toggleAircraft("Pinpoint Strike", name)}
			/>
			<Components.Button onPress={onNext}>Next</Components.Button>
		</div>
	);
};
