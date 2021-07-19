import type { Geometry, Grid, Idx, schema } from "@sudoku-studio/schema";
import type { Diff, StateRef } from "@sudoku-studio/state-manager";
import { arrayObj2array, cellCoord2CellIdx, cellIdx2cellCoord } from "../../../../board-utils/lib/board-utils";
import { pushHistory } from "../history";
import { AdjacentCellPointerHandler, CellDragTapEvent } from "../input/adjacentCellPointerHandler";
import type { InputHandler } from "../input/inputHandler";
import { userCursorState, userSelectState } from "../user";
import { makeUid } from "../util";
import type { ElementInfo } from "./element";

export const arrowInfo: ElementInfo = {
    getInputHandler: getArrowInputHandler,
    order: 90,
    inGlobalMenu: false,
    menu: {
        type: 'select',
        name: 'Arrow',
        icon: 'arrow',
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
        const [ x, y ] = cellIdx2cellCoord(idx, grid);
        if (y === prevY) {
            // If we are in the same row as the previous cell, add all between cells (if any).
            for (let betweenX = prevX + 1; betweenX < x; betweenX++) {
                addedRowCells.push(cellCoord2CellIdx([ betweenX, y ], grid));
            }
        }
        prevX = x;
        prevY = y;
    };

    // Add added row cells and resort.
    cells.push(...addedRowCells);
    cells.sort((a, b) => a - b);
}

export function getArrowInputHandler(stateRef: StateRef, grid: Grid, svg: SVGSVGElement): InputHandler {

    const pointerHandler = new AdjacentCellPointerHandler(true);

    enum Mode {
        DYNAMIC = '',
        BULB = 'bulb',
        BODY = 'body',
    }

    let mode: Mode = Mode.DYNAMIC;
    let arrowRef: null | StateRef = null;
    let bulbCells: Idx<Geometry.CELL>[] = [];
    let bodyCells: Idx<Geometry.CELL>[] = [];

    function handleDragStart(idx: Idx<Geometry.CELL>): void {
        const existingArrows = stateRef.get<schema.ArrowElement['value']>() || {};
        for (const [ arrowId, { bulb, body } ] of Object.entries(existingArrows)) {
            const bulbArr = arrayObj2array(bulb || {});
            if (bulbArr.includes(idx)) {
                // Adding body to existing arrow.
                const bodyEmpty = 0 >= arrayObj2array(body || {}).length;
                // If body is empty, use existing arrow entry. Otherwise create new with same bulb.
                arrowRef = bodyEmpty ? stateRef.ref(arrowId) : stateRef.ref(makeUid());
                mode = Mode.BODY;
                bulbCells = bulbArr;
                bodyCells = [ idx ];

                arrowRef.ref(Mode.BULB).replace(bulbArr);
                return;
            }
        }
        // Making bulb.
        arrowRef = stateRef.ref(makeUid());
        mode = Mode.BULB;
        bulbCells = [ idx ];
        bodyCells = [];
    }

    function handle(event: CellDragTapEvent) {
        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        if (Mode.DYNAMIC === mode)
            handleDragStart(idx);

        if (null == arrowRef) throw 'UNREACHABLE';

        const lineCells = (Mode.BULB === mode) ? bulbCells : bodyCells;
        const selfHit = lineCells.lastIndexOf(idx);
        if (0 <= selfHit) {
            if (Mode.BODY === mode && 0 === selfHit && 2 < lineCells.length) {
                // Allow crossing the start of the line in special situations.
                lineCells.push(idx);
            }
            else {
                lineCells.length = selfHit + 1;
            }
        }
        else {
            lineCells.push(idx);
        }

        if (Mode.BULB === mode)
            reorderArrowBulb(lineCells, grid);

        const minLength = (Mode.BULB === mode) ? 1 : 2;
        arrowRef.ref(mode).replace(minLength <= lineCells.length ? lineCells : null);
    }

    pointerHandler.onDragStart = (_event: MouseEvent) => {
        mode = Mode.DYNAMIC;
    };

    pointerHandler.onDrag = (event: CellDragTapEvent) => {
        handle(event);
    };

    pointerHandler.onDragEnd = () => {
        if (Mode.DYNAMIC === mode) return;
        if (null == arrowRef) throw 'UNREACHABLE';

        if (0 >= bulbCells.length || 1 === bodyCells.length) {
            // If 0 === bodyCells.length that means we've placed a bulb -- do not delete.
            // But if 1 === bodyCells.length then we've added empty to a bulb -- delete.
            arrowRef.replace(null);
        }
        else {
            const path = arrowRef.path().join('/');
            const diff: Diff = {
                redo: {},
                undo: { [path]: null },
            };
            bulbCells.forEach((val, i) => diff.redo[`${path}/bulb/${i}`] = val);
            bodyCells.forEach((val, i) => diff.redo[`${path}/body/${i}`] = val);
            pushHistory(diff);
        }
        arrowRef = null;
    };

    pointerHandler.onTap = (event: CellDragTapEvent) => {
        if (Mode.DYNAMIC !== mode) return;

        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        let arrowIdToDelete: null | string = null;
        for (const [ arrowId, { bulb, body } ] of Object.entries(stateRef.get<schema.ArrowElement['value']>() || {})) {
            if (arrayObj2array(body || {}).includes(idx)) {
                arrowIdToDelete = arrowId;
                break; // Prioritize body over bulb for deleting.
            }
            if (arrayObj2array(bulb || {}).includes(idx)) {
                arrowIdToDelete = arrowId;
            }
        }
        if (null != arrowIdToDelete) {
            pushHistory(stateRef.ref(`${arrowIdToDelete}`).replace(null));
        }
        else {
            handle(event);
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

