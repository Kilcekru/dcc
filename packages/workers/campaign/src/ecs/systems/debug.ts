import * as DcsJs from "@foxdelta2/dcsjs";

import { store } from "../store";

function destroyedButAlive(coalition: DcsJs.Coalition) {
    const flightGroups = store.queries.flightGroups[coalition].get("destroyed");

    for (const flightGroup of flightGroups) {
        if (flightGroup.alive) {
            // eslint-disable-next-line no-console
            console.warn("DEBUG: flight group is destroyed but alive", flightGroup)
        }
    }
}

function shouldHaveLanded(coalition: DcsJs.Coalition) {
    const flightGroups = store.queries.flightGroups[coalition];

    for (const flightGroup of flightGroups) {
        const landing = flightGroup.flightplan.waypoints.find(wp => wp.name === "Landing");

        if (landing == null) {
            // eslint-disable-next-line no-console
            console.warn("DEBUG: flight group has no landing waypoint", flightGroup)
            continue;
        }

        if (landing.arrivalTime < store.time) {
            // eslint-disable-next-line no-console
            console.warn("DEBUG: flight group should have landed", flightGroup)
        }
    }
}

export function debugTick(coalition: DcsJs.Coalition) {
    destroyedButAlive(coalition);
    shouldHaveLanded(coalition);
}