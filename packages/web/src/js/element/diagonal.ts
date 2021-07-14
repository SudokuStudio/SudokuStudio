import type { Geometry, Grid, Idx, IdxMap } from "@sudoku-studio/schema";
import type { StateRef } from "@sudoku-studio/state-manager";
import Diagonal from "../../svelte/edit/constraint/Diagonal.svelte";
import type  { ElementHandler } from "./element";
import { getMajorDiagonal, getRepeatingDigits } from "@sudoku-studio/board-utils";

export class DiagonalHandler implements ElementHandler {
    static readonly TYPE = 'diagonal';

    readonly isGlobal = true;
    readonly MenuComponent = Diagonal;
    readonly pointerHandler = null;

    private readonly _ref: StateRef;
    constructor(ref: StateRef) {
        this._ref = ref;
    }

    getViewBox(_active: boolean, _grid: Grid): null {
        return null;
    }
    getConflicts(digits: IdxMap<Geometry.CELL, number>, grid: Grid, output: Set<Idx<Geometry.CELL>>): void {
        if (this._ref.ref('positive').get<boolean>()) {
            getRepeatingDigits(digits, getMajorDiagonal(true, grid), output);
        }
        if (this._ref.ref('negative').get<boolean>()) {
            getRepeatingDigits(digits, getMajorDiagonal(false, grid), output);
        }
    }
}
