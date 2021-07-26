import type { Geometry, Grid, IdxBitset, IdxMap, schema } from "@sudoku-studio/schema";
import { getColCellIdxes, getRowCellIdxes, getBoxCellIdxes, writeRepeatingDigits } from "@sudoku-studio/board-utils";
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

    getWarnings(value: schema.BoxElement['value'], grid: Grid, digits: IdxMap<Geometry.CELL, number>, warnings: IdxBitset<Geometry.CELL>): void {
        if (null == value) return;

        const numBoxes = (grid.width / value.width) * (grid.height / value.height);
        if (!Number.isInteger(numBoxes)) throw Error('Invalid box sizing');

        for (let box = 0; box < numBoxes; box++) {
            writeRepeatingDigits(digits, getBoxCellIdxes(box, value, grid), warnings);
        }
    }
} as const;
