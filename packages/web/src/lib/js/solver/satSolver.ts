import * as Comlink from "comlink";

import type { Geometry, IdxMap, schema, Solver } from "@sudoku-studio/schema";
import type IlpSolverWorkerNamespace from "./satSolverWorker.ts";
import SatSolverWorker from './satSolverWorker.js?worker';
import LameWorker from './lameWorker.js?worker';

const getSolverWorker = (() => {
    (window as any).lameWorker = new LameWorker();
    (window as any).worker2 = new SatSolverWorker();
    (window as any).worker3 = new Worker(new URL('./satSolverWorker', import.meta.url), { type: "module" });
    let solverWorker: null | Comlink.Remote<typeof IlpSolverWorkerNamespace> = null;
    return function() {
        if (null == solverWorker) {
            solverWorker = Comlink.wrap<typeof IlpSolverWorkerNamespace>(new SatSolverWorker({ name: "SatSolverWorker" }));
            // solverWorker = Comlink.wrap<typeof IlpSolverWorkerNamespace>(new Worker(new URL('./satSolverWorker', import.meta.url), { type: "module" }));
        }
        return solverWorker;
    }
})();

export const SatSolver: Solver = {
    cantAttempt(board: schema.Board): Promise<null | string> {
        return getSolverWorker().cantAttempt(board);
    },

    solve(board: schema.Board, maxSolutions: number,
        onSolutionFoundOrComplete: (solution: null | IdxMap<Geometry.CELL, number>) => void): () => Promise<boolean>
    {
        const taskIdPromise = getSolverWorker()
            .solveAsync(board, maxSolutions, Comlink.proxy(onSolutionFoundOrComplete));

        return () => taskIdPromise.then(getSolverWorker().cancel);
    },

    solveTrueCandidates(board: schema.Board,
        onComplete: (solution: null | IdxMap<Geometry.CELL, Map<number, number>>) => void): () => Promise<boolean>
    {
        const taskIdPromise = getSolverWorker()
            .solveTrueCandidatesAsync(board, Comlink.proxy(onComplete));

        return () => taskIdPromise.then(getSolverWorker().cancel);
    }
};
