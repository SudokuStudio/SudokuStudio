import { describe, expect, test } from 'vitest';
import { cellCoord2CellIdx, getBorderPath, makePath } from '@sudoku-studio/board-utils/src';
import type { Coord, Geometry, Grid, Idx } from '@sudoku-studio/schema';

describe('makePath', () => {
    test('basic', () => {
        const path = makePath([0, 1, 2, 3], { width: 4, height: 4 });
        expect(path).toBe('M0.5,0.5L1.5,0.5L2.5,0.5L3.5,0.5');
    });
    test('squiggly', () => {
        const grid: Grid = { width: 9, height: 9 };
        const path = makePath(
            [
                [0, 0],
                [1, 1],
                [1, 2],
                [2, 1],
                [3, 1],
                [3, 0],
            ].map((coord) => cellCoord2CellIdx(coord as Coord<Geometry.CELL>, grid)),
            grid,
        );
        expect(path).toBe('M0.5,0.5L1.5,1.5L1.5,2.5L2.5,1.5L3.5,1.5L3.5,0.5');
    });
    test('squiggly with options', () => {
        const grid: Grid = { width: 9, height: 9 };
        const path = makePath(
            [
                [0, 0],
                [1, 1],
                [1, 2],
                [2, 1],
                [3, 1],
                [3, 0],
            ].map((coord) => cellCoord2CellIdx(coord as Coord<Geometry.CELL>, grid)),
            grid,
            { shortenHead: 0.05, shortenTail: 0.15, bezierRounding: 0.1 },
        );
        expect(path).toBe(
            'M0.5353553390593274,0.5353553390593274L1.4292893218813452,1.4292893218813452Q1.5,1.5 1.5,1.6L1.5,2.4Q1.5,2.5 1.5707106781186548,2.4292893218813454L2.4292893218813454,1.5707106781186548Q2.5,1.5 2.6,1.5L3.4,1.5Q3.5,1.5 3.5,1.4L3.5,0.65',
        );
    });
});

test('getBorderPath', () => {
    const grid: Grid = { width: 9, height: 9 };
    const selection: Idx<Geometry.CELL>[] = [0, 1, 3, 7, 8, 9, 10, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 31, 34, 35];
    const path = getBorderPath(selection, grid);
    expect(path).toBe(
        'M2,0L2,2L0,2L0,0ZM4,0L4,1L7,1L7,2L6,2L6,3L5,3L5,2L4,2L4,3L3,3L3,4L2,4L2,2L3,2L3,0ZM9,0L9,2L8,2L8,1L7,1L7,0ZM5,3L5,4L4,4L4,3ZM1,3L1,4L0,4L0,3ZM9,3L9,4L7,4L7,3Z',
    );
});
