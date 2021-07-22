// THIS FILE DOESN'T LIVE-RELOAD FOR SOME REASON.

import type { Geometry, IdxMap, schema } from "@sudoku-studio/schema";
import type { Cancel, Solver } from "./solver";
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
    solve(board: schema.Board, _maxSolutions: number, _timeDue: number, _onSolutionFoundOrComplete: (solution: null | IdxMap<Geometry.CELL, number>) => void): Cancel {
        getSolverWorker().postMessage(board);
        return () => {};
    },
};
