import { arrayObj2array, boardRepr, cellCoord2CellIdx } from "@sudoku-studio/board-utils";
import type { ArrayObj, Geometry, Grid, Idx } from "@sudoku-studio/schema";
import type { Diff, StateRef } from "@sudoku-studio/state-manager";
import { pushHistory } from "../history";
import { userCursorIsShownState, userSelectState } from "../user";
import { AdjacentCellPointerHandler, CellDragTapEvent } from "./adjacentCellPointerHandler";
import type { InputHandler } from "./inputHandler";

export type LineInputHandlerOptions = {
    deletePrioritizeHead: boolean,
    deletePrioritizeTail: boolean,
    allowSelfIntersection: boolean,
};

export function getLineInputHandler(stateRef: StateRef, grid: Grid, svg: SVGSVGElement, options: LineInputHandlerOptions): InputHandler {
    const { deletePrioritizeHead, deletePrioritizeTail, allowSelfIntersection } = options;

    const pointerHandler = new AdjacentCellPointerHandler(true);

    let lineRef: null | StateRef = null;
    const lineCells: Idx<Geometry.CELL>[] = [];

    function handle(event: CellDragTapEvent) {
        if (null == lineRef) throw 'UNREACHABLE';

        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        const selfHit = lineCells.indexOf(idx, allowSelfIntersection ? lineCells.length - 2 : 0);
        if (0 <= selfHit) {
            lineCells.length = selfHit + 1;
        }
        else {
            lineCells.push(idx);
        }

        lineRef.replace(1 < lineCells.length ? lineCells : null);
    }

    pointerHandler.onDragStart = (event: CellDragTapEvent) => {
        lineCells.length = 0;
        lineRef = stateRef.ref(boardRepr.makeUid());

        handle(event);
    };

    pointerHandler.onDrag = (event: CellDragTapEvent) => {
        handle(event);
    };

    pointerHandler.onDragEnd = () => {
        if (null == lineRef) {
            throw new Error('Line handler, onDragEnd NULL lineRef.');
        }

        if (1 >= lineCells.length) {
            lineRef.replace(null);
        }
        else {
            const path = lineRef.path().join('/');
            const diff: Diff = {
                redo: {},
                undo: { [path]: null },
            };
            for (let i = 0; i < lineCells.length; i++) {
                diff.redo[`${path}/${i}`] = lineCells[i];
            }
            pushHistory(diff);
        }
        lineRef = null;
    };

    pointerHandler.onTap = (event: CellDragTapEvent) => {
        const { coord, grid } = event;
        const idx = cellCoord2CellIdx(coord, grid);

        let lineIdToDelete: null | string = null;
        for (const [ lineId, lineValArrObj ] of Object.entries(stateRef.get<Record<string, ArrayObj<Idx<Geometry.CELL>>>>() || {})) {
            const lineValCells = arrayObj2array(lineValArrObj);
            if (deletePrioritizeHead && idx === lineValCells[0]) {
                lineIdToDelete = lineId;
                break;
            }
            if (deletePrioritizeTail && idx === lineValCells[lineValCells.length - 1]) {
                lineIdToDelete = lineId;
                break;
            }
            if (lineValCells.includes(idx)) {
                lineIdToDelete = lineId
            }
        }
        if (null != lineIdToDelete) {
            pushHistory(stateRef.ref(`${lineIdToDelete}`).replace(null));
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

        keydown(_event: KeyboardEvent): void {
        },
        keyup(_event: KeyboardEvent): void {
        },
        padClick(_event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }): void {
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
