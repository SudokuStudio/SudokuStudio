import type { StateRef } from "@sudoku-studio/state-manager";
import type { Grid } from "@sudoku-studio/schema";
import type { InputHandler } from "../input/inputHandler";
import { getSelectDigitInputHandler } from "../input/selectDigitInputHandler";

import Givens from "../../svelte/edit/constraint/Givens.svelte";

export const givensInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getSelectDigitInputHandler(ref, grid, svg, {
            multipleDigits: false,
            blockedByGivens: false,
            blockedByFilled: false,
        });
    },
    inGlobalMenu: false,
    menuComponent: Givens,
} as const;
export const filledInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getSelectDigitInputHandler(ref, grid, svg, {
            multipleDigits: false,
            blockedByGivens: true,
            blockedByFilled: false,
        });
    },
} as const;

export const cornerInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getSelectDigitInputHandler(ref, grid, svg, {
            multipleDigits: true,
            blockedByGivens: true,
            blockedByFilled: true,
        });
    },
} as const;
export const centerInfo = cornerInfo;

export const colorsInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getSelectDigitInputHandler(ref, grid, svg, {
            multipleDigits: true,
            blockedByGivens: false,
            blockedByFilled: false,
            digitMapping: [ "#111111", "#666666", "#b2b2b2", "#fe525d", "#e28800", "#fee076", "#6ce000", "#a0dcff", "#4e7aff", "#ec80ff" ],
        });
    },
} as const;
