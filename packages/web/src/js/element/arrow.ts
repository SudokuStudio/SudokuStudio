import { cellCoord2CellIdx, arrayObj2array, cellIdx2cellCoord } from "@sudoku-studio/board-utils";
import type { Geometry, Idx, IdxMap, ArrayObj, Grid } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import Arrow from "../../svelte/edit/constraint/Arrow.svelte";
import { AdjacentCellPointerHandler, CellDragTapEvent, CellDragStartEndEvent } from "./pointerHandler";
import type  { ElementHandler } from "./element";

export class ArrowHandler implements ElementHandler {
    static readonly TYPE = 'arrow';

    readonly isGlobal = false;
    readonly MenuComponent = Arrow;
    readonly pointerHandler = new AdjacentCellPointerHandler(true);
    readonly inputHandler = null;

    constructor(ref: StateRef) {
        this._bindPointerhandler(ref);
    }

    getViewBox(_active: boolean, _grid: Grid): null {
        return null;
    }
    getConflicts(digits: IdxMap<Geometry.CELL, number>, _grid: Grid, output: Set<Idx<Geometry.CELL>>) {
        // TODO!!!
    }

    private _bindPointerhandler(arrowState: StateRef): void {
        let arrowHead: Idx<Geometry.CELL>[] = [];

        let arrowRef: null | StateRef = null;

        this.pointerHandler.addEventListener('dragStart', ((_event: CustomEvent<CellDragStartEndEvent>) => {
            arrowHead.length = 0;
            arrowRef = arrowState.ref(`${Date.now()}_${Math.random()}`, 'head');
        }) as EventListener);

        this.pointerHandler.addEventListener('drag', ((event: CustomEvent<CellDragTapEvent>) => {
            if (null == arrowRef) throw 'UNREACHABLE';

            const { coord, grid } = event.detail;
            const idx = cellCoord2CellIdx(coord, grid);

            const i = arrowHead.indexOf(idx);
            if (0 <= i) {
                arrowHead = arrowHead.slice(0, i + 1);
            }
            else {
                arrowHead.push(idx);
            }
            arrowHead.sort((idxA, idxB) => idxA - idxB);
            arrowRef.replace(arrowHead);
        }) as EventListener);

        this.pointerHandler.addEventListener('dragEnd', ((_event: CustomEvent<CellDragStartEndEvent>) => {
            // if (1 >= len) {
            //     arrowRef!.replace(null);
            // }
        }) as EventListener);

        this.pointerHandler.addEventListener('tap', ((event: CustomEvent<CellDragTapEvent>) => {
            const { coord, grid } = event.detail;
            const idx = cellCoord2CellIdx(coord, grid);

            for (const [ thermoId, thermoVals ] of Object.entries(arrowState.get<Record<string, ArrayObj<Idx<Geometry.CELL>>>>() || {})) {
                if (idx === thermoVals[0]) {
                    arrowState.ref(`${thermoId}`).replace(null);
                    return;
                }
            }

        }) as EventListener);
    }
}
