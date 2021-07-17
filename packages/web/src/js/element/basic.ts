import type { ElementInfo } from "./element";

export const gridInfo: ElementInfo = {
    order: 101,
    permanent: true,
} as const;

export const boxInfo: ElementInfo = {
    order: 100,
    permanent: true,
} as const;
