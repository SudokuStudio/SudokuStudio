import * as Comlink from "comlink";
import * as SolverIlp from "@sudoku-studio/solver-ilp";

Comlink.expose({

});
self.addEventListener('message', e => {
    try {
        SolverIlp.findSudokuSolution();
    }
    catch (e) {
        console.error('SolverIlp ERROR', e);
    }
});
