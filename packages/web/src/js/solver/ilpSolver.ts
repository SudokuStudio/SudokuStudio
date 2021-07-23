// THIS FILE DOESN'T LIVE-RELOAD FOR SOME REASON.

import * as Comlink from "comlink";

import type { Geometry, IdxMap, schema, Solver } from "@sudoku-studio/schema";
import IlpSolverWorker from "web-worker:./ilpSolverWorker.ts";

const getSolverWorker = (() => {
    let solverWorker: null | Worker = null;
    return function(): Worker {
        if (null == solverWorker) {
            solverWorker = new IlpSolverWorker();
        }
        return solverWorker;
    }
})();

export const IlpSolver: Solver = {
    canAttempt(_board: schema.Board): boolean {
        return true;
    },
    solve(board: schema.Board, _maxSolutions: number, _timeDue: number,
        _onSolutionFoundOrComplete: (solution: null | IdxMap<Geometry.CELL, number>) => void): (cancellationReason: string) => void
    {
        getSolverWorker().postMessage(board);
        return () => {};
    },
};
