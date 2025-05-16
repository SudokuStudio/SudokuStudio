import type { Geometry, Grid, IdxBitset, IdxMap, schema } from '@sudoku-studio/schema';
import type { Diff } from '@sudoku-studio/state-manager/src';
import { AdjacentCellPointerHandler } from '../input/adjacentCellPointerHandler';
import type { CellDragTapEvent } from '../input/adjacentCellPointerHandler';
import type { InputHandler } from '../input/inputHandler';
import {
    cellCoord2CellIdx,
    cellIdx2cellCoord,
    getBorderCellPairs,
    idxMapToKeysArray,
    markDigitsFailingCondition,
} from '@sudoku-studio/board-utils/src';
import type { ElementInfo, GetInputHandler, InputHandlerContext } from './element';

export const minInfo: ElementInfo<schema.RegionElement['value']> = {
    getInputHandler: makeGetInputHandler('max'),
    order: 20,
    inGlobalMenu: false,
    menu: { type: 'select', name: 'Min', icon: 'min' },
    getWarnings(
        value: schema.RegionElement['value'],
        grid: Grid,
        _regionMap: IdxMap<Geometry.CELL, number>,
        digits: IdxMap<Geometry.CELL, number>,
        warnings: IdxBitset<Geometry.CELL>,
    ): void {
        const cells = idxMapToKeysArray(value || {});
        for (const [inCell, outCell] of getBorderCellPairs(cells, grid)) {
            const inDigit = digits[inCell];
            const outDigit = digits[outCell];
            if (null == inDigit || null == outDigit) continue;
            if (outDigit < inDigit) {
                warnings[inCell] = true;
                warnings[outCell] = true;
            }
        }
    },
    meta: {
        description: 'Contiguous groups of cells with less-than signs must be less than all of their edge neighbors.',
        tags: ['extreme', 'fortress', 'minimum', 'less'],
        category: ['local', 'cell'],
    },
};

export const maxInfo: ElementInfo<schema.RegionElement['value']> = {
    getInputHandler: makeGetInputHandler('min'),
    order: 21,
    inGlobalMenu: false,
    menu: { type: 'select', name: 'Max', icon: 'max' },
    getWarnings(
        value: schema.RegionElement['value'],
        grid: Grid,
        _regionMap: IdxMap<Geometry.CELL, number>,
        digits: IdxMap<Geometry.CELL, number>,
        warnings: IdxBitset<Geometry.CELL>,
    ): void {
        const cells = idxMapToKeysArray(value || {});
        for (const [inCell, outCell] of getBorderCellPairs(cells, grid)) {
            const inDigit = digits[inCell];
            const outDigit = digits[outCell];
            if (null == inDigit || null == outDigit) continue;
            if (inDigit < outDigit) {
                warnings[inCell] = true;
                warnings[outCell] = true;
            }
        }
    },
    meta: {
        description:
            'Contiguous groups of cells with greater-than signs must be greater than all of their edge neighbors.',
        tags: ['extreme', 'fortress', 'maximum', 'more', 'greater'],
        category: ['local', 'cell'],
    },
};

export const evenInfo: ElementInfo<schema.RegionElement['value']> = {
    getInputHandler: makeGetInputHandler('odd'),
    order: 40,
    inGlobalMenu: false,
    menu: { type: 'select', name: 'Even', icon: 'odd-even' },
    getWarnings(
        value: schema.RegionElement['value'],
        _grid: Grid,
        _regionMap: IdxMap<Geometry.CELL, number>,
        digits: IdxMap<Geometry.CELL, number>,
        warnings: IdxBitset<Geometry.CELL>,
    ): void {
        const cells = idxMapToKeysArray(value || {});
        markDigitsFailingCondition(digits, cells, warnings, (x) => 0 == x % 2);
    },
    meta: {
        description: 'Cells with a gray square must be even.',
        tags: ['parity', 'modulo', 'remainder'],
        category: ['local', 'cell'],
    },
};

export const oddInfo: ElementInfo<schema.RegionElement['value']> = {
    getInputHandler: makeGetInputHandler('even'),
    order: 41,
    inGlobalMenu: false,
    menu: { type: 'select', name: 'Odd', icon: 'odd-even' },
    getWarnings(
        value: schema.RegionElement['value'],
        _grid: Grid,
        _regionMap: IdxMap<Geometry.CELL, number>,
        digits: IdxMap<Geometry.CELL, number>,
        warnings: IdxBitset<Geometry.CELL>,
    ): void {
        const cells = idxMapToKeysArray(value || {});
        markDigitsFailingCondition(digits, cells, warnings, (x) => 1 == x % 2);
    },
    meta: {
        description: 'Cells with a gray circle must be odd.',
        tags: ['parity', 'modulo', 'remainder'],
        category: ['local', 'cell'],
    },
};

export const columnIndexerInfo: ElementInfo<schema.RegionElement['value']> = {
    getInputHandler,
    order: 42,
    inGlobalMenu: false,
    menu: { type: 'select', name: 'Column Indexer', icon: 'odd-even' },
    getWarnings(
        value: schema.RegionElement['value'],
        grid: Grid,
        _regionMap: IdxMap<Geometry.CELL, number>,
        digits: IdxMap<Geometry.CELL, number>,
        warnings: IdxBitset<Geometry.CELL>,
    ): void {
        indexerWarnings(
            value,
            grid,
            digits,
            warnings,
            (r, _c, indexerValue) => [indexerValue - 1, r],
            (_r, c, indexeeValue) => indexeeValue != c + 1,
        );
    },
    meta: {
        description:
            'If the cell with this constraint is at row R, column C and has digit V, then the cell at Row R, column V has digit C.',
        tags: ['indexer'],
        category: ['local', 'cell'],
    },
};

export const rowIndexerInfo: ElementInfo<schema.RegionElement['value']> = {
    getInputHandler,
    order: 42,
    inGlobalMenu: false,
    menu: { type: 'select', name: 'Row Indexer', icon: 'odd-even' },
    getWarnings(
        value: schema.RegionElement['value'],
        grid: Grid,
        _regionMap: IdxMap<Geometry.CELL, number>,
        digits: IdxMap<Geometry.CELL, number>,
        warnings: IdxBitset<Geometry.CELL>,
    ): void {
        indexerWarnings(
            value,
            grid,
            digits,
            warnings,
            (_r, c, indexerValue) => [c, indexerValue - 1],
            (r, _c, indexeeValue) => indexeeValue != r + 1,
        );
    },
    meta: {
        description:
            'If the cell with this constraint is at row R, column C and has digit V, then the cell at Row V, column C has digit R.',
        tags: ['indexer'],
        category: ['local', 'cell'],
    },
};

function makeGetInputHandler(oppositeConstraint?: string): GetInputHandler<schema.RegionElement['value']> {
    return (ctx) => getInputHandler(ctx, oppositeConstraint);
}

/**
 * @param oppositeConstraint - Another constraint that this constraint cannot share cells with. So attempting to place
 *      this constraint there will ignore that cell.
 */
function getInputHandler(
    ctx: InputHandlerContext<schema.RegionElement['value']>,
    oppositeConstraint?: string,
): InputHandler {
    const pointerHandler = new AdjacentCellPointerHandler(true);

    enum Mode {
        DYNAMIC,
        ADDING,
        REMOVING,
    }
    let mode = Mode.DYNAMIC;

    const fullDiff: Diff = { redo: {}, undo: {} };

    function handle(event: CellDragTapEvent) {
        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        if (Mode.DYNAMIC === mode) {
            // If the first cell already has the constraint, set mode to removing
            // Otherwise, set mode to adding
            mode = ctx.stateRef.ref<true>(`${idx}`).get() ? Mode.REMOVING : Mode.ADDING;
        }

        if (null != oppositeConstraint) {
            const oppositeConstraintValue = ctx.getCellValue(oppositeConstraint, idx);
            if (oppositeConstraintValue) {
                // Cannot place constraint if the opposite constraint is already in the cell
                return;
            }
        }

        const stateValue = mode === Mode.ADDING ? true : null;
        const diff = ctx.stateRef.ref(`${idx}`).replace(stateValue);
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
        handle(event);
    };

    pointerHandler.onDragEnd = () => {
        ctx.pushHistory(fullDiff);
        fullDiff.redo = {};
        fullDiff.undo = {};
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

function indexerWarnings(
    value: schema.RegionElement['value'],
    grid: Grid,
    digits: IdxMap<Geometry.CELL, number>,
    warnings: IdxBitset<Geometry.CELL>,
    f: (r: number, c: number, indexerValue: number) => [number, number],
    testValue: (r: number, c: number, indexeeValue: number) => boolean,
): void {
    const cells = idxMapToKeysArray(value || {});
    for (const indexer of cells) {
        const indexerValue = digits[indexer];
        if (null == indexerValue) continue;
        const [c, r] = cellIdx2cellCoord(indexer, grid);
        const indexee = cellCoord2CellIdx(f(r, c, indexerValue), grid);
        const indexeeValue = digits[indexee];
        if (null == indexeeValue) continue;
        if (testValue(r, c, indexeeValue)) {
            warnings[indexer] = true;
            warnings[indexee] = true;
        }
    }
}
