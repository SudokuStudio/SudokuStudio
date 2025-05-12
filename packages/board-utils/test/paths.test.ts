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
    test('squiggly + options', () => {
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

describe('getBorderPath', () => {
    test('basic', () => {
        const grid: Grid = { width: 9, height: 9 };
        const selection: Idx<Geometry.CELL>[] = [
            0, 1, 3, 7, 8, 9, 10, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 31, 34, 35,
        ];
        const path = getBorderPath(selection, grid);
        expect(path).toBe(
            'M2,0L2,2L0,2L0,0ZM4,0L4,1L7,1L7,2L6,2L6,3L5,3L5,2L4,2L4,3L3,3L3,4L2,4L2,2L3,2L3,0ZM9,0L9,2L8,2L8,1L7,1L7,0ZM5,3L5,4L4,4L4,3ZM1,3L1,4L0,4L0,3ZM9,3L9,4L7,4L7,3Z',
        );
    });
    test('bezierRounding', () => {
        const grid: Grid = { width: 9, height: 9 };
        const selection: Idx<Geometry.CELL>[] = [
            0, 1, 3, 7, 8, 9, 10, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 31, 34, 35,
        ];
        const path = getBorderPath(selection, grid, { bezierRounding: 0.1 });
        expect(path).toBe(
            'M2,1.9Q2,2 1.9,2L0.1,2Q0,2 0,1.9L0,0.1Q0,0 0.1,0L1.9,0Q2,0 2,0.1ZM4,0.9Q4,1 4.1,1L6.9,1Q7,1 7,1.1L7,1.9Q7,2 6.9,2L6.1,2Q6,2 6,2.1L6,2.9Q6,3 5.9,3L5.1,3Q5,3 5,2.9L5,2.1Q5,2 4.9,2L4.1,2Q4,2 4,2.1L4,2.9Q4,3 3.9,3L3.1,3Q3,3 3,3.1L3,3.9Q3,4 2.9,4L2.1,4Q2,4 2,3.9L2,2.1Q2,2 2.1,2L2.9,2Q3,2 3,1.9L3,0.1Q3,0 3.1,0L3.9,0Q4,0 4,0.1ZM9,1.9Q9,2 8.9,2L8.1,2Q8,2 8,1.9L8,1.1Q8,1 7.9,1L7.1,1Q7,1 7,0.9L7,0.1Q7,0 7.1,0L8.9,0Q9,0 9,0.1ZM5,3.9Q5,4 4.9,4L4.1,4Q4,4 4,3.9L4,3.1Q4,3 4.1,3L4.9,3Q5,3 5,3.1ZM1,3.9Q1,4 0.9,4L0.1,4Q0,4 0,3.9L0,3.1Q0,3 0.1,3L0.9,3Q1,3 1,3.1ZM9,3.9Q9,4 8.9,4L7.1,4Q7,4 7,3.9L7,3.1Q7,3 7.1,3L8.9,3Q9,3 9,3.1Z',
        );
    });
});
