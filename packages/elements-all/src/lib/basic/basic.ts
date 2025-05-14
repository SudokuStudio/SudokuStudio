import type { Geometry, Grid, IdxBitset, IdxMap, schema } from '@sudoku-studio/schema';
import {
    arrayObj2array,
    getColCellIdxes,
    getRowCellIdxes,
    GRID_REGION_THICKNESS_HALF,
    GRID_THICKNESS_HALF,
    idxMapToKeysArray,
    writeRepeatingDigits,
} from '@sudoku-studio/board-utils/src';
import type { ElementInfo } from '@sudoku-studio/elements/src';
import GridRender from './GridRender.svelte';
import GridRegionRender from './GridRegionRender.svelte';

export const gridInfo: ElementInfo<undefined> = {
    component: GridRender,
    margin: GRID_THICKNESS_HALF,
    order: 101,
    permanent: true,

    getWarnings(
        _value: any,
        grid: Grid,
        _regionMap: IdxMap<Geometry.CELL, number>,
        digits: IdxMap<Geometry.CELL, number>,
        warnings: IdxBitset<Geometry.CELL>,
    ): void {
        for (let row = 0; row < grid.height; row++) {
            writeRepeatingDigits(digits, getRowCellIdxes(row, grid), warnings);
        }
        for (let col = 0; col < grid.width; col++) {
            writeRepeatingDigits(digits, getColCellIdxes(col, grid), warnings);
        }
    },
} as const;

export const gridRegionInfo: ElementInfo<schema.GridRegionElement['value']> = {
    component: GridRegionRender,
    margin: GRID_REGION_THICKNESS_HALF,
    order: 100,
    permanent: true,

    getWarnings(
        value: schema.GridRegionElement['value'],
        _grid: Grid,
        _regionMap: IdxMap<Geometry.CELL, number>,
        digits: IdxMap<Geometry.CELL, number>,
        warnings: IdxBitset<Geometry.CELL>,
    ): void {
        if (null == value) return;

        const boxes = arrayObj2array(value || {});
        for (const box of boxes) {
            writeRepeatingDigits(digits, idxMapToKeysArray(box), warnings);
        }
    },
} as const;
