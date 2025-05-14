import type { Geometry, Grid, Idx, IdxBitset, IdxMap, schema } from '@sudoku-studio/schema';
import type { Diff, StateRef } from '@sudoku-studio/state-manager/src';
import { arrayObj2array, boardRepr, cellCoord2CellIdx, cellIdx2cellCoord } from '@sudoku-studio/board-utils/src';
import { type ElementInfo, inputHandler, adjacentCellPointerHandler } from '@sudoku-studio/elements/src';
import ArrowRender from './ArrowRender.svelte';

export const arrowInfo: ElementInfo<schema.ArrowElement['value']> = {
    component: ArrowRender,
    getInputHandler: getArrowInputHandler,
    order: 90,
    inGlobalMenu: false,
    menu: { type: 'select', name: 'Arrow', icon: 'arrow' },
    getWarnings(
        value: schema.ArrowElement['value'],
        _grid: Grid,
        _regionMap: IdxMap<Geometry.CELL, number>,
        digits: IdxMap<Geometry.CELL, number>,
        warnings: IdxBitset<Geometry.CELL>,
    ): void {
        outer: for (const { bulb, body } of Object.values(value || {})) {
            const bulbArrReversed = arrayObj2array(bulb);
            bulbArrReversed.reverse();

            let targetSum = 0;
            let power = 1;
            for (const bulbIdx of bulbArrReversed) {
                const digit = digits[bulbIdx];
                if (null == digit) {
                    continue outer;
                }

                targetSum += power * digit;
                power *= 10;
            }

            const [_bodyStart, ...bodyArrRest] = arrayObj2array(body);
            let actualSum = 0;
            let allFilled = true;
            for (const bodyIdx of bodyArrRest) {
                const digit = digits[bodyIdx];
                if (null == digit) {
                    allFilled = false;
                } else {
                    actualSum += digit;
                }
            }

            if (targetSum < actualSum || (allFilled && targetSum !== actualSum)) {
                bulbArrReversed.forEach((idx) => (warnings[idx] = true));
                bodyArrRest.forEach((idx) => (warnings[idx] = true));
            }
        }
    },
    meta: {
        description: 'Digits along arrows must sum to the digit in the circle; digits may repeat.',
        tags: ['line', 'sum'],
        category: ['local', 'line'],
    },
};

/**
 * Ensures that are sorted in row-major order, and fills in any row gaps.
 * @param cells
 * @param grid
 */
function reorderArrowBulb(cells: Idx<Geometry.CELL>[], grid: Grid): void {
    let prevX = -1;
    let prevY = Number.POSITIVE_INFINITY;
    cells.sort((a, b) => a - b);

    const addedRowCells: Idx<Geometry.CELL>[] = [];
    for (const idx of cells) {
        const [x, y] = cellIdx2cellCoord(idx, grid);
        if (y === prevY) {
            // If we are in the same row as the previous cell, add all between cells (if any).
            for (let betweenX = prevX + 1; betweenX < x; betweenX++) {
                addedRowCells.push(cellCoord2CellIdx([betweenX, y], grid));
            }
        }
        prevX = x;
        prevY = y;
    }

    // Add added row cells and resort.
    cells.push(...addedRowCells);
    cells.sort((a, b) => a - b);
}

export function getArrowInputHandler(
    ctx: inputHandler.InputHandlerContext<schema.ArrowElement['value']>,
): inputHandler.InputHandler {
    const pointerHandler = new adjacentCellPointerHandler.AdjacentCellPointerHandler(true);

    enum Mode {
        DYNAMIC = '',
        BULB = 'bulb',
        BODY = 'body',
    }

    let mode: Mode = Mode.DYNAMIC;
    let arrowRef: null | StateRef<schema.ArrowElementItem> = null;
    let bulbCells: Idx<Geometry.CELL>[] = [];
    let bodyCells: Idx<Geometry.CELL>[] = [];

    function handleDragStart(idx: Idx<Geometry.CELL>): void {
        const existingArrows = ctx.stateRef.get() || {};
        for (const [arrowId, { bulb, body }] of Object.entries(existingArrows)) {
            const bulbArr = arrayObj2array(bulb || {});
            if (bulbArr.includes(idx)) {
                // Adding body to existing arrow.
                const bodyEmpty = 0 >= arrayObj2array(body || {}).length;
                // If body is empty, use existing arrow entry. Otherwise create new with same bulb.
                arrowRef = bodyEmpty ? ctx.stateRef.ref(arrowId) : ctx.stateRef.ref(boardRepr.makeUid());
                mode = Mode.BODY;
                bulbCells = bulbArr;
                bodyCells = [idx];

                arrowRef.ref(Mode.BULB).replace(bulbArr);
                return;
            }
        }
        // Making bulb.
        arrowRef = ctx.stateRef.ref(boardRepr.makeUid());
        mode = Mode.BULB;
        bulbCells = [idx];
        bodyCells = [];
    }

    function handle(event: adjacentCellPointerHandler.CellDragTapEvent) {
        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        if (Mode.DYNAMIC === mode) handleDragStart(idx);

        if (null == arrowRef) throw 'UNREACHABLE';

        const lineCells = Mode.BULB === mode ? bulbCells : bodyCells;
        const selfHit = lineCells.lastIndexOf(idx);
        if (0 <= selfHit) {
            if (Mode.BODY === mode && 0 === selfHit && 2 < lineCells.length) {
                // Allow crossing the start of the line in special situations.
                lineCells.push(idx);
            } else {
                lineCells.length = selfHit + 1;
            }
        } else {
            lineCells.push(idx);
        }

        if (Mode.BULB === mode) reorderArrowBulb(lineCells, grid);

        const minLength = Mode.BULB === mode ? 1 : 2;
        arrowRef.ref(mode).replace(minLength <= lineCells.length ? lineCells : null);
    }

    pointerHandler.onDragStart = (event: adjacentCellPointerHandler.CellDragTapEvent) => {
        mode = Mode.DYNAMIC;
        handle(event);
    };

    pointerHandler.onDrag = (event: adjacentCellPointerHandler.CellDragTapEvent) => {
        handle(event);
    };

    pointerHandler.onDragEnd = () => {
        if (null == arrowRef) throw 'UNREACHABLE';

        if (0 >= bulbCells.length || 1 === bodyCells.length) {
            // If 0 === bodyCells.length that means we've placed a bulb -- do not delete.
            // But if 1 === bodyCells.length then we've added empty to a bulb -- delete.
            arrowRef.replace(null);
        } else {
            const path = arrowRef.path().join('/');
            const diff: Diff = { redo: {}, undo: { [path]: null } };
            bulbCells.forEach((val, i) => (diff.redo[`${path}/bulb/${i}`] = val));
            bodyCells.forEach((val, i) => (diff.redo[`${path}/body/${i}`] = val));
            ctx.pushHistory(diff);
        }
        arrowRef = null;
    };

    pointerHandler.onTap = (event: adjacentCellPointerHandler.CellDragTapEvent) => {
        if (Mode.BODY !== mode) return;
        // If we are in the arrow body mode but haven't dragged to a different cell, delete the arrow

        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        let arrowIdToDelete: null | string = null;
        for (const [arrowId, { bulb }] of Object.entries(ctx.stateRef.get() || {})) {
            if (arrayObj2array(bulb || {}).includes(idx)) {
                arrowIdToDelete = arrowId;
                break;
            }
        }
        if (null != arrowIdToDelete) {
            ctx.pushHistory(ctx.stateRef.ref(`${arrowIdToDelete}`).replace(null));
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

        keydown(_event: KeyboardEvent): void {},
        keyup(_event: KeyboardEvent): void {},
        padClick(_event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }): void {},

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
