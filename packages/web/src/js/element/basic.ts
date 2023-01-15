import type { Geometry, Grid, IdxBitset, IdxMap, schema } from "@sudoku-studio/schema";
import { arrayObj2array, getColCellIdxes, getRowCellIdxes, idxMapToKeysArray, writeRepeatingDigits } from "@sudoku-studio/board-utils";
import type { ElementInfo } from "./element";

export const gridInfo: ElementInfo = {
    order: 101,
    permanent: true,

    getWarnings(_value: any, grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        for (let row = 0; row < grid.height; row++) {
            writeRepeatingDigits(digits, getRowCellIdxes(row, grid), warnings);
        }
        for (let col = 0; col < grid.width; col++) {
            writeRepeatingDigits(digits, getColCellIdxes(col, grid), warnings);
        }
    }
} as const;

export const boxInfo: ElementInfo = {
    order: 100,
    permanent: true,

    getWarnings(value: schema.BoxElement['value'], _grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        if (null == value) return;

        const boxes = arrayObj2array(value || {});
        for (const box of boxes) {
            writeRepeatingDigits(digits, idxMapToKeysArray(box), warnings);
        }
    }
} as const;
