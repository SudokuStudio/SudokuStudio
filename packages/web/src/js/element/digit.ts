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
                "#e0e0e0",
                "#b2b2b2",
                hsluv.hsluvToHex([  10,  90,  75 ]), // red
                hsluv.hsluvToHex([  10,  90,  55 ]), // dark red
                hsluv.hsluvToHex([  70,  80,  90 ]), // yellow
                hsluv.hsluvToHex([ 120,  50,  90 ]), // light green
                hsluv.hsluvToHex([ 120,  80,  60 ]), // dark green
                hsluv.hsluvToHex([ 310,  50,  85 ]), // pink
                hsluv.hsluvToHex([ 230,  70,  85 ]), // blue
                hsluv.hsluvToHex([ 230,  80,  65 ]), // dark blue
            ],
        });
    },
    order: 10,
} as const;
