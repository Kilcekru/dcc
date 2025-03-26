import { onEvent, rpc } from "@kilcekru/dcc-lib-rpc";
import { useEffect } from "react";
import { Config } from "./data/config";
import React from "react";
import { campaignStore } from "./stores/campaign";
import { useStore } from "@kilcekru/dcc-lib-components";
import { Home } from "./routes/__home";
import { routerStore } from "./stores/router";
import { onWorkerEvent, Triggers } from "./worker";
import type * as Types from "@kilcekru/dcc-shared-types";

async function loadCampaign() {
    try {
        // Load the campaign state from persistence
        const campaign = await rpc.campaign.resumeCampaign(Config.campaignVersion);

        // eslint-disable-next-line no-console
        console.log("campaign loaded", campaign);

        // If no campaign is found, we need to create a new one
        if (campaign == null) {
            console.log("campaign is null");
            routerStore.set({ route: "create" });
            return;
        }

        // Load the campaign state in the campaign logic worker
        Triggers.load({ ...campaign });
    } catch (e) {
        console.error("Resume Campaign", e instanceof Error ? e.message : "unknown error"); // eslint-disable-line no-console
        routerStore.set({ route: "load-error" });
    }
}
export function App() {
    const route = useStore(routerStore, (state) => state.route);
    useEffect(() => {
        loadCampaign();
    })

    useEffect(() => {
        const serializedSubscription = onWorkerEvent("serialized", async (event: Types.Campaign.WorkerEventSerialized) => {
            console.log("serialized", event);
            if (event.state.active === false) {
                // deactivate?.();
            }
            // void saveCampaign(event.state);
        });
        const stateUpdateSubscription = onWorkerEvent("stateUpdate", async (event: Types.Campaign.WorkerEventStateUpdate) => {
            routerStore.set({ route: "home" });
            console.log("stateUpdate", event.state.timeMultiplier, event.state.time);
            campaignStore.set({
                campaign: event.state,
            })
        });
        const timeUpdateSubscription = onWorkerEvent("timeUpdate", (event: Types.Campaign.WorkerEventTimeUpdate) => {
            campaignStore.set((state) => {
                if (state.campaign == null) return state;
                const next = structuredClone(state.campaign);

                next.time = event.time;

                return {
                    campaign: next,
                }
            })
        });

        return () => {
            serializedSubscription.dispose();
            stateUpdateSubscription.dispose();
            timeUpdateSubscription.dispose();
        }
    }, []);
    return <div className="w-full h-full dark dark:bg-black flex flex-col text-white">
        {route === "init" ? (
            <div className="w-full h-full flex flex-col justify-center items-center dark:bg-black">
                <div className='text-white text-4xl'>Welcome</div>
                <div className='text-white text-2xl opacity-60'>loading campaign...</div>
            </div>
        ) : null}
        {route === "home" ? (
            <Home />
        ) : null}
    </div>
}