import type { Coord, Geometry, Grid, Idx, IdxBitset, IdxMap, schema } from '@sudoku-studio/schema';
import type { Diff, StateRef } from '@sudoku-studio/state-manager/src';
import { inputHandler } from '@sudoku-studio/elements/src';
import type { ElementInfo } from '@sudoku-studio/elements/src';
import { adjacentCellPointerHandler } from '@sudoku-studio/elements/src';
import {
    arrayObj2array,
    boardRepr,
    cellCoord2CellIdx,
    cellIdx2cellCoord,
    warnClones,
} from '@sudoku-studio/board-utils/src';
import * as hsluv from 'hsluv';
import { makeA1Column } from '../../web/src/lib/js/util.js';

export const cloneInfo: ElementInfo<schema.CloneElement['value']> = {
    getInputHandler,
    order: 10,
    inGlobalMenu: false,
    menu: { type: 'select', name: 'Clone', icon: 'clone' },
    getWarnings(
        value: schema.CloneElement['value'],
        _grid: Grid,
        _regionMap: IdxMap<Geometry.CELL, number>,
        digits: IdxMap<Geometry.CELL, number>,
        warnings: IdxBitset<Geometry.CELL>,
    ): void {
        for (const { a, b } of Object.values(value || {})) {
            if (null == a || null == b) continue;

            const cellsA = arrayObj2array(a);
            const cellsB = arrayObj2array(b);

            warnClones(digits, cellsA, cellsB, warnings);
        }
    },
    meta: {
        description: 'Digits in cloned sets must be the same and in the same order.',
        tags: [],
        category: ['local', 'area'],
    },
};

function getInputHandler(
    ctx: inputHandler.InputHandlerContext<schema.CloneElement['value']>,
): inputHandler.InputHandler {
    const pointerHandler = new adjacentCellPointerHandler.AdjacentCellPointerHandler(true);

    let cloneRef: null | StateRef<typeof cloneEntry> = null;
    let moveStart: null | Coord<Geometry.CELL> = null;
    let cloneEntry = {
        label: null as null | string,
        color: null as null | string,
        a: [] as Idx<Geometry.CELL>[],
        b: [] as Idx<Geometry.CELL>[],
    };

    enum Mode {
        DYNAMIC, // Wait to see: SELECT if on blank, MOVING if on existing.
        SELECTING,
        MOVING,
    }

    // Undefined for none, true for adding, null for removing.
    let mode: Mode = Mode.DYNAMIC;

    const max = 100;
    function onDigitInput(code: string): boolean {
        if (null == cloneRef) return false;

        let digit = inputHandler.parseDigit(code);
        if (undefined === digit) return false;

        const oldVal = cloneRef.ref<true | number>('sum').get();
        if (null != digit && 'number' === typeof oldVal) {
            const multiDigit = oldVal * 10 + digit;
            if (multiDigit < max) digit = multiDigit;
        }

        return true;
    }

    function getExistingCloneAtIdx(idx: Idx<Geometry.CELL>): null | [string, 'a' | 'b'] {
        for (const [cloneId, { a, b }] of Object.entries(ctx.stateRef.get() || {})) {
            if (arrayObj2array(a || {}).includes(idx)) {
                return [cloneId, 'a'];
            }
            if (arrayObj2array(b || {}).includes(idx)) {
                return [cloneId, 'b'];
            }
        }
        return null;
    }

    function makeNewClone(): typeof cloneEntry {
        const existingLabels = new Set();
        for (const { label } of Object.values(ctx.stateRef.get() || {})) {
            if (null != label) existingLabels.add(label);
        }
        for (let i = 0; ; i++) {
            const label = makeA1Column(i);
            if (!existingLabels.has(label)) {
                return { label, color: hsluv.hsluvToHex([(127 * i) % 360, 50, 50]), a: [], b: [] };
            }
        }
    }

    function startDrag(idx: Idx<Geometry.CELL>): void {
        const existingClone = getExistingCloneAtIdx(idx);
        if (null != existingClone) {
            const [cloneId, clickedAB] = existingClone;
            const unclickedAB = 'a' === clickedAB ? 'b' : 'a';

            cloneRef = ctx.stateRef.ref<typeof cloneEntry>(cloneId);
            mode = Mode.MOVING;
            cloneEntry = Object.assign({}, cloneRef.get());

            if (null != cloneEntry[unclickedAB]) {
                const clickedArr = arrayObj2array(cloneEntry[clickedAB]);
                const clickedI = clickedArr.indexOf(idx);
                moveStart = cellIdx2cellCoord(cloneEntry[unclickedAB][clickedI], ctx.grid);

                cloneEntry.a = arrayObj2array(cloneEntry[unclickedAB]);
                cloneEntry.b = [];
            } else {
                moveStart = cellIdx2cellCoord(idx, ctx.grid);
                cloneEntry.a = arrayObj2array(cloneEntry[clickedAB]);
                cloneEntry.b = [];
            }
        } else {
            cloneRef = ctx.stateRef.ref(boardRepr.makeUid());
            mode = Mode.SELECTING;
            cloneEntry = makeNewClone();
        }
    }

    const fullDiff: Diff = { redo: {}, undo: {} };

    function handle(event: adjacentCellPointerHandler.CellDragTapEvent) {
        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        if (Mode.DYNAMIC === mode) {
            startDrag(idx);
        }
        if (null == cloneRef) throw 'UNREACHABLE';

        if (Mode.SELECTING === mode) {
            const selfHit = cloneEntry.a.indexOf(idx);
            if (0 <= selfHit) {
                return; // No redundant stuffs.
            } else {
                cloneEntry.a.push(idx);
            }
        } else if (Mode.MOVING === mode) {
            if (null == moveStart) throw 'UNREACHABLE';

            const offset = cellIdx2cellCoord(idx, grid);
            offset[0] -= moveStart[0];
            offset[1] -= moveStart[1];

            const newB: Idx<Geometry.CELL>[] = [];
            for (let i = 0; i < cloneEntry.a.length; i++) {
                const aIdx = cloneEntry.a[i];

                const offsetIdx = cellIdx2cellCoord(aIdx, grid);
                offsetIdx[0] += offset[0];
                offsetIdx[1] += offset[1];
                if (offsetIdx[0] < 0 || grid.width <= offsetIdx[0] || offsetIdx[1] < 0 || grid.height <= offsetIdx[1]) {
                    return; // Invalid location.
                }

                const bIdx = cellCoord2CellIdx(offsetIdx, grid);
                newB.push(bIdx);
            }

            cloneEntry.b = newB;
        } else throw 'UNREACHABLE';

        const diff = cloneRef.replace(cloneEntry);
        ctx.pushHistory(diff);
    }

    pointerHandler.onDragStart = (event: adjacentCellPointerHandler.CellDragTapEvent) => {
        mode = Mode.DYNAMIC;
        moveStart = null;
        cloneRef = null;

        handle(event);
    };

    pointerHandler.onDrag = (event: adjacentCellPointerHandler.CellDragTapEvent) => {
        handle(event);
    };

    pointerHandler.onDragEnd = () => {
        ctx.pushHistory(fullDiff);
        fullDiff.redo = {};
        fullDiff.undo = {};
    };

    pointerHandler.onTap = (event: adjacentCellPointerHandler.CellDragTapEvent) => {
        if (Mode.MOVING !== mode) return;
        // If we are in the clone moving mode but haven't dragged to a different cell, delete the clone

        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        const existingClone = getExistingCloneAtIdx(idx);
        if (null != existingClone) {
            const [cloneId, _] = existingClone;
            // Delete
            const diff = ctx.stateRef.ref(cloneId).replace(null);
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
