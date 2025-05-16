import type { Geometry, Grid, Idx, IdxBitset, IdxMap, schema } from '@sudoku-studio/schema';
import type { Diff, StateRef } from '@sudoku-studio/state-manager/src';
import { adjacentCellPointerHandler, parseDigit } from '@sudoku-studio/elements-utils/src';
import {
    boardRepr,
    cellCoord2CellIdx,
    idxMapToKeysArray,
    warnSum,
    writeRepeatingDigits,
} from '@sudoku-studio/board-utils/src';
import KillerRender from './KillerRender.svelte';
import type { ElementInfo, InputHandler, InputHandlerContext } from '@sudoku-studio/elements-schema';

export const killerInfo: ElementInfo<schema.KillerElement['value']> = {
    component: KillerRender,
    getInputHandler,
    order: 120,
    inGlobalMenu: false,
    menu: { type: 'select', name: 'Killer Cage', icon: 'killer' },
    getWarnings(
        value: schema.KillerElement['value'],
        _grid: Grid,
        _regionMap: IdxMap<Geometry.CELL, number>,
        digits: IdxMap<Geometry.CELL, number>,
        warnings: IdxBitset<Geometry.CELL>,
    ): void {
        for (const { sum, cells } of Object.values(value || {})) {
            const cellsArr = idxMapToKeysArray<Geometry.CELL>(cells);
            writeRepeatingDigits(digits, cellsArr, warnings);

            if ('number' !== typeof sum) continue;
            warnSum(digits, cellsArr, warnings, sum);
        }
    },
    meta: {
        description: 'Digits in cages must sum to the given cage total (if given); digits may not repeat.',
        tags: ['partial', 'cage', 'sum'],
        category: ['local', 'area'],
    },
};

function getInputHandler(ctx: InputHandlerContext<schema.KillerElement['value']>): InputHandler {
    const pointerHandler = new adjacentCellPointerHandler.AdjacentCellPointerHandler(false);

    let cageRef: null | StateRef<{ sum?: number; cells: IdxBitset<Geometry.CELL> }> = null;

    enum Mode {
        DYNAMIC,
        ADDING,
        REMOVING,
    }
    let mode = Mode.DYNAMIC;

    const max = 100;
    function onDigitInput(code: string): boolean {
        if (null == cageRef) return false;

        let digit = parseDigit(code);
        if (undefined === digit) return false;

        const oldVal = cageRef.ref<true | number>('sum').get();
        if (null != digit && 'number' === typeof oldVal) {
            const multiDigit = oldVal * 10 + digit;
            if (multiDigit < max) digit = multiDigit;
        }

        if (null === digit && null == oldVal) {
            // If delete on empty, delete the whole cage.
            const diff = cageRef.replace(null);
            ctx.pushHistory(diff);
        } else {
            const diff = cageRef.ref<number>('sum').replace(digit);
            ctx.pushHistory(diff);
        }
        return true;
    }

    function getExistingCageAtIdx(idx: Idx<Geometry.CELL>): null | string {
        for (const [cageId, { sum: _, cells }] of Object.entries(ctx.stateRef.get() || {})) {
            if (cells[idx]) {
                return cageId;
            }
        }
        return null;
    }

    function startDrag(idx: Idx<Geometry.CELL>): void {
        if (Mode.DYNAMIC === mode) {
            const cageId = getExistingCageAtIdx(idx);
            cageRef = ctx.stateRef.ref(cageId || boardRepr.makeUid());
            mode = null == cageId ? Mode.ADDING : Mode.REMOVING;
        }
    }

    const fullDiff: Diff = { redo: {}, undo: {} };

    function handle(event: adjacentCellPointerHandler.CellDragTapEvent) {
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

    pointerHandler.onDragStart = (event: adjacentCellPointerHandler.CellDragTapEvent) => {
        mode = Mode.DYNAMIC;
        handle(event);
    };

    pointerHandler.onDrag = (event: adjacentCellPointerHandler.CellDragTapEvent) => {
        mode = Mode.ADDING;
        handle(event);
    };

    pointerHandler.onDragEnd = () => {
        ctx.pushHistory(fullDiff);
        fullDiff.redo = {};
        fullDiff.undo = {};
    };

    pointerHandler.onTap = (event: adjacentCellPointerHandler.CellDragTapEvent) => {
        if (Mode.REMOVING !== mode) return;
        // If we are still in the removing mode, delete the killer cage

        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        const cageId = getExistingCageAtIdx(idx);
        if (null != cageId) {
            // Delete
            const diff = ctx.stateRef.ref(cageId).replace(null);
            ctx.pushHistory(diff);
        }
    };

    return {
        load(): void {
            ctx.clearUserSelection();
        },
        unload(): void {
            pointerHandler.mouseUp();
        },

        blur(_event: FocusEvent): void {},

        keydown(event: KeyboardEvent): void {
            if (onDigitInput(event.code)) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        },
        keyup(_event: KeyboardEvent): void {},
        padClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }): void {
            if (onDigitInput(event.currentTarget.value)) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        },

        mouseDown(event: MouseEvent): void {
            pointerHandler.mouseDown(event, ctx.grid, ctx.svg);
        },
        mouseMove(event: MouseEvent): void {
            pointerHandler.mouseMove(event, ctx.grid, ctx.svg);
        },
        mouseUp(_event: MouseEvent): void {
            pointerHandler.mouseUp();
        },
        leave(event: MouseEvent): void {
            pointerHandler.leave(event, ctx.grid, ctx.svg);
        },
        click(event: MouseEvent): void {
            pointerHandler.click(event, ctx.grid, ctx.svg);
        },
        touchDown(event: TouchEvent): void {
            pointerHandler.touchDown(event, ctx.grid, ctx.svg);
        },
        touchMove(event: TouchEvent): void {
            pointerHandler.touchMove(event, ctx.grid, ctx.svg);
        },
        touchUp(event: TouchEvent): void {
            pointerHandler.touchUp(event, ctx.grid, ctx.svg);
        },
    } as const;
}
