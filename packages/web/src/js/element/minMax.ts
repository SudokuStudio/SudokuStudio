import type { Geometry, Grid, Idx } from "@sudoku-studio/schema";
import type { Diff, StateRef } from "@sudoku-studio/state-manager";
import { AdjacentCellPointerHandler, CellDragTapEvent } from "../input/adjacentCellPointerHandler";
import type { InputHandler } from "../input/inputHandler";
import { cellCoord2CellIdx } from "@sudoku-studio/board-utils";
import { pushHistory } from "../history";
import { userCursorState, userSelectState } from "../user";
import type { ElementInfo } from "./element";

export const minInfo: ElementInfo = {
    getInputHandler,

    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Min',
        icon: 'min',
    },
};

export const maxInfo: ElementInfo = {
    getInputHandler,

    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Max',
        icon: 'max',
    },
};

function getInputHandler(stateRef: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
    const pointerHandler = new AdjacentCellPointerHandler(true);

    // Undefined for none, true for adding, null for removing.
    let mode: undefined | true | null = undefined;
    function getMode(idx: Idx<Geometry.CELL>): typeof mode {
        if (undefined === mode) {
            mode = !stateRef.ref(`${idx}`).get<true>() || null;
        }
        return mode;
    }

    const fullDiff: Diff = {
        redo: {},
        undo: {},
    };

    pointerHandler.onDragStart = (_event: MouseEvent) => {
        mode = undefined;
    };

    pointerHandler.onDrag = (event: CellDragTapEvent) => {
        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        const diff = stateRef.ref(`${idx}`).replace(getMode(idx));
        if (null != diff) {
            Object.assign(fullDiff.redo, diff.redo);
            Object.assign(fullDiff.undo, diff.undo);
        }
    };

    pointerHandler.onDragEnd = () => {
        pushHistory(fullDiff);
        fullDiff.redo = {};
        fullDiff.undo = {};
    };

    pointerHandler.onTap = (event: CellDragTapEvent) => {
        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        const diff = stateRef.ref(`${idx}`).replace(getMode(idx));
        pushHistory(diff);
    };

    return {
        load(): void {
            // TODO: not really that great of a way of doing this.
            userSelectState.replace(null);
            userCursorState.replace(null);
        },
        unload(): void {
            pointerHandler.up();
        },

        blur(_event: FocusEvent): void {
        },

        keydown(_event: KeyboardEvent): void {
        },
        keyup(_event: KeyboardEvent): void {
        },
        padClick(_event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }): void {
        },

        down(event: MouseEvent): void {
            pointerHandler.down(event);
        },
        move(event: MouseEvent): void {
            pointerHandler.move(event, grid, svg);
        },
        up(_event: MouseEvent): void {
            pointerHandler.up();
        },
        leave(event: MouseEvent): void {
            pointerHandler.leave(event, grid, svg);
        },
        click(event: MouseEvent): void {
            pointerHandler.click(event, grid, svg);
        },
    } as const;
}
