import type { Geometry, Idx, ArrayObj, Grid } from "@sudoku-studio/schema";
import type { Diff, StateRef } from "@sudoku-studio/state-manager";
import { AdjacentCellPointerHandler, CellDragTapEvent } from "../input/adjacentCellPointerHandler";
import type { InputHandler } from "../input/inputHandler";
import { arrayObj2array, cellCoord2CellIdx } from "@sudoku-studio/board-utils";
import { pushHistory } from "../history";
import { userCursorState, userSelectState } from "../user";
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
        name: 'Thermos',
        icon: 'thermo',
    },
};
