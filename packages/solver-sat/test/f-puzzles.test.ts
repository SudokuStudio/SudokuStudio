import type { ArrayObj, Geometry, IdxMap } from '@sudoku-studio/schema';
import { describe, expect, test } from 'vitest';
import { CancellationToken, cantAttempt, solve } from '@sudoku-studio/solver-sat/src';
import { fPuzzles } from '@sudoku-studio/board-format/src';
import { arrayObj2array } from '@sudoku-studio/board-utils/src';
import { fPuzzlesBoards } from '@sudoku-studio/board-examples/src';

describe('FPuzzles', () => {
    const timeout = 300_000;
    test.concurrent.each(fPuzzlesBoards)(
        '"%s"',
        async (_name, board64, solnStr) => {
            const board = fPuzzles.parseFpuzzles(board64, (type, value) => ({ type, value }) as any);

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
