import * as Types from "@kilcekru/dcc-shared-types";
import { useAtom } from "@xstate/store/react";
import React from "react";

import { getEntity } from "../../../lib/get-entity";
import { selectedEntityIdAtom } from "../../../stores/entity-drawer";
import { FlightGroup } from "./flight-group";

function isFlightGroup(entity: Types.Serialization.EntitySerialized): entity is Types.Serialization.FlightGroupSerialized {
    return entity.entityType.includes("FlightGroup")
}

export function Details() {
    const selectedEntityId = useAtom(selectedEntityIdAtom)
    const entity = selectedEntityId == null ? null : getEntity<Types.Serialization.EntitySerialized>(selectedEntityId)
    if (entity == null) return null;
    if (isFlightGroup(entity)) return <FlightGroup flightGroup={entity} />
    return null
}