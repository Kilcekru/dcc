import React from "react";
import { useStore } from "@kilcekru/dcc-lib-components";
import { entityDrawerStore } from "../../../stores/entity-drawer";
import { campaignStore } from "../../../stores/campaign";

export function EntityDrawer() {
    const drawerRef = React.useRef<HTMLDivElement>(null);
    const entityId = useStore(entityDrawerStore, (state) => state.entityId);
    const entity = useStore(campaignStore, (state) => state.campaign?.entities.get(entityId ?? ""));

    React.useEffect(() => {
        if (entityId) {
            drawerRef.current?.showPopover()
        }
    }, [entityId])
    return <div ref={drawerRef} popover="manual" className="absolute flex flex-col top-0 left-0 bottom-0 w-64 h-full bg-slate-800 -translate-x-full starting:open:-translate-x-full open:translate-x-0 transition-all duration-300 transition-discrete">
        <h2 className="text-white">Entity Drawer</h2>

    </div>
}
