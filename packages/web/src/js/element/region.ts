import type { Geometry, Grid, Idx, IdxBitset, IdxMap, schema } from "@sudoku-studio/schema";
import type { Diff, StateRef } from "@sudoku-studio/state-manager";
import { AdjacentCellPointerHandler, CellDragTapEvent } from "../input/adjacentCellPointerHandler";
import type { InputHandler } from "../input/inputHandler";
import { cellCoord2CellIdx, getBorderCellPairs, idxMapToKeysArray } from "@sudoku-studio/board-utils";
import { pushHistory } from "../history";
import { userCursorIsShownState, userSelectState } from "../user";
import type { ElementInfo } from "./element";
import { markDigitsFailingCondition } from "@sudoku-studio/board-utils";

export const minInfo: ElementInfo = {
    getInputHandler,
    order: 20,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Min',
        icon: 'min',
    },
    getWarnings(value: schema.RegionElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        const cells = idxMapToKeysArray(value || {});
        for (const [ inCell, outCell ] of getBorderCellPairs(cells, grid)) {
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
        tags: [ 'extreme', 'fortress', 'minimum', 'less' ],
        category: [ 'local', 'cell' ],
    },
};

export const maxInfo: ElementInfo = {
    getInputHandler,
    order: 21,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Max',
        icon: 'max',
    },
    getWarnings(value: schema.RegionElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        const cells = idxMapToKeysArray(value || {});
        for (const [ inCell, outCell ] of getBorderCellPairs(cells, grid)) {
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
        description: 'Contiguous groups of cells with greater-than signs must be greater than all of their edge neighbors.',
        tags: [ 'extreme', 'fortress', 'maximum', 'more', 'greater' ],
        category: [ 'local', 'cell' ],
    },
};

export const evenInfo: ElementInfo = {
    getInputHandler,
    order: 40,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Even',
        icon: 'odd-even',
    },
    getWarnings(value: schema.RegionElement['value'], _grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        const cells = idxMapToKeysArray(value || {});
        markDigitsFailingCondition(digits, cells, warnings, x => 0 == x % 2);
    },
    meta: {
        description: 'Cells with a gray square must be even.',
        tags: [ 'parity', 'modulo', 'remainder' ],
        category: [ 'local', 'cell' ],
    },
};

export const oddInfo: ElementInfo = {
    getInputHandler,
    order: 41,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Odd',
        icon: 'odd-even',
    },
    getWarnings(value: schema.RegionElement['value'], _grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        const cells = idxMapToKeysArray(value || {});
        markDigitsFailingCondition(digits, cells, warnings, x => 1 == x % 2);
    },
    meta: {
        description: 'Cells with a gray circle must be odd.',
        tags: [ 'parity', 'modulo', 'remainder' ],
        category: [ 'local', 'cell' ],
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
            userCursorIsShownState.replace(false);
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
