import type { StateRef } from "@sudoku-studio/state-manager";
import type { Grid } from "@sudoku-studio/schema";
import type { InputHandler } from "../input/inputHandler";
import { getSelectDigitInputHandler } from "../input/selectDigitInputHandler";
import hsluv from "hsluv";

import type { ElementInfo } from "./element";

export const givensInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getSelectDigitInputHandler(ref, grid, svg, {
            multipleDigits: false,
            blockedByGivens: false,
            blockedByFilled: false,
            nextMode: 'corner',
        });
    },
    order: 220,
    permanent: true,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Given',
        icon: 'given',
    },
} as const;
export const filledInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getSelectDigitInputHandler(ref, grid, svg, {
            multipleDigits: false,
            blockedByGivens: true,
            blockedByFilled: false,
            nextMode: 'corner',
        });
    },
    order: 210,
} as const;

export const cornerInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getSelectDigitInputHandler(ref, grid, svg, {
            multipleDigits: true,
            blockedByGivens: true,
            blockedByFilled: true,
            nextMode: 'center',
        });
    },
    order: 200,
} as const;
export const centerInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getSelectDigitInputHandler(ref, grid, svg, {
            multipleDigits: true,
            blockedByGivens: true,
            blockedByFilled: true,
            nextMode: 'colors',
        });
    },
    order: 200,
} as const;

export const colorsInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getSelectDigitInputHandler(ref, grid, svg, {
            multipleDigits: true,
            blockedByGivens: false,
            blockedByFilled: false,
            nextMode: 'filled',
            digitMapping: [
                "#111111",
                "#666666",
                "#b2b2b2",
                hsluv.hsluvToHex([  10, 100, 60 ]),
                hsluv.hsluvToHex([  40, 100, 65 ]),
                hsluv.hsluvToHex([  70, 100, 92 ]),
                hsluv.hsluvToHex([ 120, 100, 80 ]),
                hsluv.hsluvToHex([ 230, 100, 85 ]),
                hsluv.hsluvToHex([ 260, 100, 55 ]),
                hsluv.hsluvToHex([ 300, 100, 70 ]),
            ],
        });
    },
    order: 10,
} as const;
