import type { Grid } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import type { InputHandler } from "../input/inputHandler";
import type { ElementInfo } from "./element";
import { getLineInputHandler } from "../input/lineInputHandler";

export const thermoInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getLineInputHandler(ref, grid, svg, {
            deletePrioritizeHead: true,
            deletePrioritizeTail: false,
        });
    },
    order: 30,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Thermo',
        icon: 'thermo',
    },
};

export const betweenInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getLineInputHandler(ref, grid, svg, {
            deletePrioritizeHead: true,
            deletePrioritizeTail: true,
        });
    },
    order: 50,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Between',
        icon: 'between',
    },
};

export const palindromeInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getLineInputHandler(ref, grid, svg, {
            deletePrioritizeHead: false,
            deletePrioritizeTail: false,
        });
    },
    order: 60,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Palindrome',
        icon: 'palindrome',
    },
};

export const whisperInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getLineInputHandler(ref, grid, svg, {
            deletePrioritizeHead: false,
            deletePrioritizeTail: false,
        });
    },
    order: 70,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Whisper',
        icon: 'whisper',
    },
};

export const renbanInfo: ElementInfo = {
    getInputHandler(ref: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
        return getLineInputHandler(ref, grid, svg, {
            deletePrioritizeHead: false,
            deletePrioritizeTail: false,
        });
    },
    order: 80,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Renban',
        icon: 'renban',
    },
};
