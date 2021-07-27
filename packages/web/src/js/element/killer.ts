import type { Geometry, Grid, Idx, IdxBitset, IdxMap, schema } from "@sudoku-studio/schema";
import type { Diff, StateRef } from "@sudoku-studio/state-manager";
import { AdjacentCellPointerHandler, CellDragTapEvent } from "../input/adjacentCellPointerHandler";
import type { InputHandler } from "../input/inputHandler";
import { parseDigit } from "../input/inputHandler";
import { cellCoord2CellIdx, idxMapToKeysArray, warnSum, writeRepeatingDigits } from "@sudoku-studio/board-utils";
import { userCursorState, userSelectState } from "../user";
import type { ElementInfo } from "./element";
import { makeUid } from "../util";
import { pushHistory } from "../history";

export const killerInfo: ElementInfo = {
    getInputHandler,
    order: 120,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Killer Cage',
        icon: 'killer',
    },

    getWarnings(value: schema.KillerElement['value'], _grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        for (const { sum, cells } of Object.values(value || {})) {
            const cellsArr = idxMapToKeysArray<Geometry.CELL>(cells);
            writeRepeatingDigits(digits, cellsArr, warnings);

            if ('number' !== typeof sum) continue;
            warnSum(digits, cellsArr, warnings, sum);
        }
    },
};

function getInputHandler(stateRef: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
    const pointerHandler = new AdjacentCellPointerHandler(true);

    let cageRef: null | StateRef = null;

    // Undefined for none, true for adding, null for removing.
    let mode: undefined | true | null = undefined;

    const max = 100;
    function onDigitInput(code: string): boolean {
        if (null == cageRef) return false;

        let digit = parseDigit(code)
        if (undefined === digit) return false;

        const oldVal = cageRef.ref('sum').get<true | number>();
        if (null != digit && 'number' === typeof oldVal) {
            const multiDigit = oldVal * 10 + digit;
            if (multiDigit < max)
                digit = multiDigit;
        }

        if (null === digit && null == oldVal) {
            // If delete on empty, delete the whole cage.
            const diff = cageRef.replace(null);
            pushHistory(diff);
        }
        else {
            const diff = cageRef.ref('sum').replace(digit);
            pushHistory(diff);
        }
        return true;
    }

    function getExistingCageAtIdx(idx: Idx<Geometry.CELL>): null | string {
        for (const [ cageId, { sum: _, cells } ] of Object.entries(stateRef.get<schema.KillerElement['value']>() || {})) {
            if (cells[idx]) {
                return cageId;
            }
        }
        return null;
    }

    function startDrag(idx: Idx<Geometry.CELL>): void {
        if (undefined === mode) {
            const cageId = getExistingCageAtIdx(idx);
            cageRef = stateRef.ref(cageId || makeUid());
            mode = true;
        }
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

        if (undefined === mode) {
            startDrag(idx);
        }
        if (null == cageRef) throw 'UNREACHABLE';

        const diff = cageRef.ref('cells', `${idx}`).replace(mode);
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
        // Ensure this is a tap and not a drag.
        if (undefined !== mode) return;

        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        const cageId = getExistingCageAtIdx(idx);
        if (null != cageId) {
            // Delete
            const diff = stateRef.ref(cageId).replace(null);
            pushHistory(diff);
        }
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

        keydown(event: KeyboardEvent): void {
            if (onDigitInput(event.code)) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        },
        keyup(_event: KeyboardEvent): void {
        },
        padClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }): void {
            if (onDigitInput(event.currentTarget.value)) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
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
