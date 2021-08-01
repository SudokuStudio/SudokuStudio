import * as Comlink from "comlink";

import type { Geometry, IdxMap, schema, Solver } from "@sudoku-studio/schema";
import type IlpSolverWorkerNamespace from "./satSolverWorker";

const getSolverWorker = (() => {
    let solverWorker: null | Comlink.Remote<typeof IlpSolverWorkerNamespace> = null;
    return function() {
        if (null == solverWorker) {
            solverWorker = Comlink.wrap<typeof IlpSolverWorkerNamespace>(new Worker(__replace.WORKER_SATSOLVER_SCRIPT));
        }
        return solverWorker;
    }
})();

export const SatSolver: Solver = {
    cannotAttempt(board: schema.Board): Promise<null | string> {
        return getSolverWorker().cannotAttempt(board);
    },

    solve(board: schema.Board, maxSolutions: number,
        onSolutionFoundOrComplete: (solution: null | IdxMap<Geometry.CELL, number>) => void): () => Promise<boolean>
    {
        const taskIdPromise = getSolverWorker()
            .solveAsync(board, maxSolutions, Comlink.proxy(onSolutionFoundOrComplete));

        return () => taskIdPromise.then(getSolverWorker().cancel);
    }
};
