import { CancellationToken, cannotAttempt, solve } from "../dist/solver-sat";
import { fPuzzles } from "@sudoku-studio/board-format";
import { arrayObj2array } from "@sudoku-studio/board-utils";
import { ArrayObj, Geometry, IdxMap } from "@sudoku-studio/schema";

import fpuzzlesBoards from "@sudoku-studio/boards/fpuzzles";

describe('fpuzzles', () => {
    const timeout = 300_000;
    test.each(fpuzzlesBoards)('"%s"', async (_name, board64, solnStr) => {
        const board = fPuzzles.parseFpuzzles(board64);

        const reason = cannotAttempt(board);
        expect(reason).toBeNull();

        const token: CancellationToken = {};
        setTimeout(() => token.cancelled = true, timeout);

        const solns: IdxMap<Geometry.CELL, number>[] = [];
        const success = await solve(board, 2, soln => {
            if (null == soln) return;
            solns.push(soln);
            if (1 < solns.length) token.cancelled = true;
        }, token);
        expect(success).toBeTruthy();

        expect(solns).toHaveLength(1);
        const singleSolnStr = arrayObj2array(solns[0] as ArrayObj<number>).join('');
        expect(singleSolnStr).toEqual(solnStr);
    }, timeout + 1000);
});