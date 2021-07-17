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

    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Between',
        icon: 'between',
    },
};
