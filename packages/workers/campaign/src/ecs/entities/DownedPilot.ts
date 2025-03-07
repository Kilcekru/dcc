import * as Types from "@kilcekru/dcc-shared-types";

import { Events, Serialization } from "../../utils";
import { QueryKey, store } from "../store";
import { Group, GroupProps } from "./_base/Group";

export interface DownedPilotProps extends Omit<GroupProps, "entityType" | "queries"> {
	created: number;
}

export class DownedPilot extends Group<keyof Events.EventMap.DownedPilot> {
	#created: number;

	private constructor(args: DownedPilotProps | Types.Serialization.DownedPilotSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: {
					...args,
					entityType: "DownedPilot" as const,
					queries: ["downedPilots", "mapEntities"] as QueryKey[],
					position: args.position,
				};
		super(superArgs);

		this.#created = args.created;
	}

	static create(args: Omit<DownedPilotProps, "created">) {
		return new DownedPilot({
			...args,
			created: store.time,
		});
	}

	override toMapJSON(): Types.Campaign.DownedPilotMapItem {
		return {
			...super.toMapJSON(),
			type: "downedPilot",
		};
	}

	override toJSON(): Types.Campaign.DownedPilotItem {
		return {
			...super.toJSON(),
			position: this.position,
			name: this.name,
			created: this.#created,
		};
	}

	static deserialize(args: Types.Serialization.DownedPilotSerialized) {
		return new DownedPilot(args);
	}

	override serialize(): Types.Serialization.DownedPilotSerialized {
		return {
			...super.serialize(),
			entityType: "DownedPilot",
			name: this.name,
			created: this.#created,
		};
	}
}
