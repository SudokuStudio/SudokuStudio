import type { Geometry, Grid, Idx, IdxBitset, IdxMap, schema } from "@sudoku-studio/schema";
import type { Diff, StateRef } from "@sudoku-studio/state-manager";
import { AdjacentCellPointerHandler, CellDragTapEvent } from "../input/adjacentCellPointerHandler";
import type { InputHandler } from "../input/inputHandler";
import { parseDigit } from "../input/inputHandler";
import { boardRepr, cellCoord2CellIdx, idxMapToKeysArray, warnSum, writeRepeatingDigits } from "@sudoku-studio/board-utils";
import { userCursorIsShownState, userSelectState } from "../user";
import type { ElementInfo } from "./element";
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
    meta: {
        description: 'Digits in cages must sum to the given cage total (if given); digits may not repeat.',
        tags: [ 'partial', 'cage', 'sum' ],
        category: [ 'local', 'area' ],
    },
};

function getInputHandler(stateRef: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {
    const pointerHandler = new AdjacentCellPointerHandler(false);

    let cageRef: null | StateRef = null;

    enum Mode {
        DYNAMIC,
        ADDING,
        REMOVING,
    };
    let mode = Mode.DYNAMIC;

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
        if (Mode.DYNAMIC === mode) {
            const cageId = getExistingCageAtIdx(idx);
            cageRef = stateRef.ref(cageId || boardRepr.makeUid());
            mode = null == cageId ? Mode.ADDING : Mode.REMOVING;
        }
    }

    const fullDiff: Diff = {
        redo: {},
        undo: {},
    };

    function handle(event: CellDragTapEvent) {
        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        if (Mode.DYNAMIC === mode) {
            startDrag(idx);
        }
        if (null == cageRef) throw 'UNREACHABLE';

        const diff = cageRef.ref('cells', `${idx}`).replace(mode);
        if (null != diff) {
            Object.assign(fullDiff.redo, diff.redo);
            Object.assign(fullDiff.undo, diff.undo);
        }
    }

    pointerHandler.onDragStart = (event: CellDragTapEvent) => {
        mode = Mode.DYNAMIC;
        handle(event);
    };

    pointerHandler.onDrag = (event: CellDragTapEvent) => {
        mode = Mode.ADDING;
        handle(event);
    };

    pointerHandler.onDragEnd = () => {
        pushHistory(fullDiff);
        fullDiff.redo = {};
        fullDiff.undo = {};
    };

    pointerHandler.onTap = (event: CellDragTapEvent) => {
        if (Mode.REMOVING !== mode) return;
        // If we are still in the removing mode, delete the killer cage

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
            userCursorIsShownState.replace(false);
        },
        unload(): void {
            pointerHandler.mouseUp();
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

        mouseDown(event: MouseEvent): void {
            pointerHandler.mouseDown(event, grid, svg);
        },
        mouseMove(event: MouseEvent): void {
            pointerHandler.mouseMove(event, grid, svg);
        },
        mouseUp(_event: MouseEvent): void {
            pointerHandler.mouseUp();
        },
        leave(event: MouseEvent): void {
            pointerHandler.leave(event, grid, svg);
        },
        click(event: MouseEvent): void {
            pointerHandler.click(event, grid, svg);
        },
        touchDown(event: TouchEvent): void {
            pointerHandler.touchDown(event, grid, svg);
        },
        touchMove(event: TouchEvent): void {
            pointerHandler.touchMove(event, grid, svg);
        },
        touchUp(event: TouchEvent): void {
            pointerHandler.touchUp(event, grid, svg);
        },
    } as const;
}
