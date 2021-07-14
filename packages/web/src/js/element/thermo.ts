import { cellCoord2CellIdx, arrayObj2array } from "@sudoku-studio/board-utils";
import type { Geometry, Idx, IdxMap, ArrayObj, Grid } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import Thermo from "../../svelte/edit/constraint/Thermo.svelte";
import { AdjacentCellPointerHandler, CellDragTapEvent, CellDragStartEndEvent } from "./pointerHandler";
import type  { ElementHandler } from "./element";

export class ThermoHandler implements ElementHandler {
    static readonly TYPE = 'thermo';

    readonly isGlobal = false;
    readonly MenuComponent = Thermo;
    readonly pointerHandler = new AdjacentCellPointerHandler(true);
    readonly inputHandler = null;

    private readonly _thermoState: StateRef;
    constructor(ref: StateRef) {
        this._thermoState = ref;
        this._bindPointerhandler(ref);
    }

    getViewBox(_active: boolean, _grid: Grid): null {
        return null;
    }
    getConflicts(digits: IdxMap<Geometry.CELL, number>, _grid: Grid, output: Set<Idx<Geometry.CELL>>) {
        const thermos = this._thermoState.get<Record<string, ArrayObj<Idx<Geometry.CELL>>>>() || {};
        for (const thermoCells of Object.values(thermos).map(arrayObj2array)) {
            let prevCell = Number.NEGATIVE_INFINITY;
            for (const cellIdx of thermoCells) {
                const digit = digits[cellIdx];
                if (null != digit && digit <= prevCell) {
                    output.add(cellIdx);
                }
            }
        }
    }

    private _bindPointerhandler(thermoState: StateRef): void {
        let thermoRef: null | StateRef = null;
        let len = 0;

        this.pointerHandler.addEventListener('dragStart', ((_event: CustomEvent<CellDragStartEndEvent>) => {
            len = 0;
            thermoRef = thermoState.ref(`${Date.now()}_${Math.random()}`);
        }) as EventListener);

        this.pointerHandler.addEventListener('drag', ((event: CustomEvent<CellDragTapEvent>) => {
            if (null == thermoRef) throw 'UNREACHABLE';

            const { coord, grid } = event.detail;
            const idx = cellCoord2CellIdx(coord, grid);

            for (const [ i, oldIdx ] of Object.entries(thermoRef.get<ArrayObj<Idx<Geometry.CELL>>>() || {})) {
                if (idx === oldIdx) {
                    len = +i + 1;
                    thermoRef.replace(arrayObj2array(thermoRef.get<ArrayObj<Idx<Geometry.CELL>>>() || {}).slice(0, len));
                    return;
                }
            }

            thermoRef.ref(`${len}`).replace(idx);
            len++;
        }) as EventListener);

        this.pointerHandler.addEventListener('dragEnd', ((_event: CustomEvent<CellDragStartEndEvent>) => {
            if (1 >= len) {
                thermoRef!.replace(null);
            }
        }) as EventListener);

        this.pointerHandler.addEventListener('tap', ((event: CustomEvent<CellDragTapEvent>) => {
            const { coord, grid } = event.detail;
            const idx = cellCoord2CellIdx(coord, grid);

            for (const [ thermoId, thermoVals ] of Object.entries(thermoState.get<Record<string, ArrayObj<Idx<Geometry.CELL>>>>() || {})) {
                if (idx === thermoVals[0]) {
                    thermoState.ref(`${thermoId}`).replace(null);
                    return;
                }
            }

        }) as EventListener);
    }
}
