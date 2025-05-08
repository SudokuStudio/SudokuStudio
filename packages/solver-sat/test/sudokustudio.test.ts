import type { ArrayObj, Geometry, IdxMap } from '@sudoku-studio/schema';
import { describe, expect, test } from 'vitest';
import { CancellationToken, cantAttempt, solve } from '@sudoku-studio/solver-sat/src';
import { parseSudokuStudio } from '@sudoku-studio/board-format/src';
import { arrayObj2array } from '@sudoku-studio/board-utils/src';
import { sudokuStudioBoards } from '@sudoku-studio/board-examples/src';

describe('SudokuStudio', () => {
    const timeout = 300_000;
    test.concurrent.each(sudokuStudioBoards)(
        '"%s"',
        async (_name, board64, solnStr) => {
            const board = parseSudokuStudio(board64);

            const reason = cantAttempt(board);
            expect(reason).toBeNull();

            const token: CancellationToken = {};
            setTimeout(() => (token.cancelled = true), timeout);

            const solns: IdxMap<Geometry.CELL, number>[] = [];
            const success = await solve(
                board,
                2,
                (soln) => {
                    if (null == soln) return;
                    solns.push(soln);
                    if (1 < solns.length) token.cancelled = true;
                },
                token,
            );
            expect(success).toBeTruthy();

            expect(solns).toHaveLength(1);
            const singleSolnStr = arrayObj2array(solns[0] as ArrayObj<number>).join('');
            expect(singleSolnStr).toEqual(solnStr);
        },
        timeout + 1000,
    );
});
