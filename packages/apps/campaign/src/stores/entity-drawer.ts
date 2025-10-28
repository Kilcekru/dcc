import { createAtom } from "@xstate/store";

export const selectedEntityIdAtom = createAtom<string | undefined>(undefined);
