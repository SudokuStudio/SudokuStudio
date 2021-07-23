// THIS FILE DOESN'T LIVE-RELOAD FOR SOME REASON. (something will web-worker: rollup magic).

import * as Comlink from "comlink";

import type { Geometry, IdxMap, schema, Solver } from "@sudoku-studio/schema";
import IlpSolverWorker from "web-worker:./satSolverWorker.ts";
import type IlpSolverWorkerNamespace from "./satSolverWorker";

const getSolverWorker = (() => {
    let solverWorker: null | Comlink.Remote<typeof IlpSolverWorkerNamespace> = null;
    return function() {
        if (null == solverWorker) {
            solverWorker = Comlink.wrap<typeof IlpSolverWorkerNamespace>(new IlpSolverWorker());
        }
        return solverWorker;
    }
})();

export const IlpSolver: Solver = {
    cantAttempt(board: schema.Board): Promise<null | string> {
        return getSolverWorker().cantAttempt(board);
    },

    solve(board: schema.Board, maxSolutions: number,
        onSolutionFoundOrComplete: (solution: null | IdxMap<Geometry.CELL, number>) => void): () => void
    {
        const taskIdPromise = getSolverWorker()
            .solveAsync(board, maxSolutions, Comlink.proxy(onSolutionFoundOrComplete));

        return () => taskIdPromise.then(getSolverWorker().cancel);
    }
};
