import type { StateRef } from "@sudoku-studio/state-manager";
import type { Grid } from "@sudoku-studio/schema";
import type { InputHandler } from "../input/inputHandler";
import { getSelectDigitInputHandler } from "../input/selectDigitInputHandler";

import Givens from "../../svelte/edit/constraint/Givens.svelte";

export const givensInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        console.log('GIVENS!');
        return getSelectDigitInputHandler(ref, grid, svg, false);
    },
    inGlobalMenu: false,
    menuComponent: Givens,
} as const;
export const filledInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getSelectDigitInputHandler(ref, grid, svg, false);
    },
} as const;

export const cornerInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getSelectDigitInputHandler(ref, grid, svg, true);
    },
} as const;
export const centerInfo = cornerInfo;
export const colorsInfo = cornerInfo;
